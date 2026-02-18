import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  students,
  learningPlans,
  learningSteps,
  studentProgress,
  knowledgeBase,
  sessions,
  actions,
  weeklyMemos,
  type Student,
  type InsertStudent,
  type LearningPlan,
  type InsertLearningPlan,
  type LearningStep,
  type InsertLearningStep,
  type StudentProgress,
  type InsertStudentProgress,
  type Knowledge,
  type InsertKnowledge,
  type Session,
  type InsertSession,
  type Action,
  type InsertAction,
  type WeeklyMemo,
  type InsertWeeklyMemo,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// 受講生関連
export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(students).orderBy(desc(students.createdAt));
}

export async function getStudentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createStudent(data: InsertStudent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(students).values(data) as any;
  return Number(result.insertId);
}

export async function updateStudent(id: number, data: Partial<InsertStudent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(students).set(data).where(eq(students.id, id));
}

export async function deleteStudent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 関連データを削除
  await db.delete(sessions).where(eq(sessions.studentId, id));
  await db.delete(actions).where(eq(actions.studentId, id));
  await db.delete(weeklyMemos).where(eq(weeklyMemos.studentId, id));
  await db.delete(studentProgress).where(eq(studentProgress.studentId, id));
  
  // 受講生本体を削除
  await db.delete(students).where(eq(students.id, id));
}

// 学習プラン関連
export async function getAllLearningPlans() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(learningPlans).orderBy(desc(learningPlans.createdAt));
}

export async function getLearningPlanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(learningPlans).where(eq(learningPlans.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLearningPlan(data: InsertLearningPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(learningPlans).values(data) as any;
  return Number(result[0]?.insertId || result.insertId);
}

export async function updateLearningPlan(id: number, data: Partial<InsertLearningPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(learningPlans).set(data).where(eq(learningPlans.id, id));
}

export async function deleteLearningPlan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(learningPlans).where(eq(learningPlans.id, id));
}

// 学習ステップ関連
export async function getStepsByPlanId(planId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(learningSteps).where(eq(learningSteps.planId, planId)).orderBy(learningSteps.stepOrder);
}

export async function createLearningStep(data: InsertLearningStep) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(learningSteps).values(data) as any;
  return Number(result.insertId);
}

export async function updateLearningStep(id: number, data: Partial<InsertLearningStep>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(learningSteps).set(data).where(eq(learningSteps.id, id));
}

export async function deleteLearningStep(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(learningSteps).where(eq(learningSteps.id, id));
}

// 受講生プラン進捗関連
export async function getProgressByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studentProgress).where(eq(studentProgress.studentId, studentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertStudentProgress(data: InsertStudentProgress & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (data.id) {
    await db.update(studentProgress).set(data).where(eq(studentProgress.id, data.id));
    return data.id;
  } else {
    const result = await db.insert(studentProgress).values(data) as any;
    return Number(result.insertId);
  }
}

// ナレッジ関連
export async function getAllKnowledge() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.updatedAt));
}

export async function getKnowledgeByStepId(stepId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(knowledgeBase).where(eq(knowledgeBase.stepId, stepId));
}

export async function createKnowledge(data: InsertKnowledge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(knowledgeBase).values(data) as any;
  return Number(result.insertId);
}

export async function updateKnowledge(id: number, data: Partial<InsertKnowledge>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(knowledgeBase).set(data).where(eq(knowledgeBase.id, id));
}

export async function deleteKnowledge(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
}

// セッション関連
export async function getSessionsByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sessions).where(eq(sessions.studentId, studentId)).orderBy(desc(sessions.sessionDate));
}

export async function createSession(data: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sessions).values(data) as any;
  return Number(result.insertId);
}

export async function updateSession(id: number, data: Partial<InsertSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessions).set(data).where(eq(sessions.id, id));
}

export async function deleteSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sessions).where(eq(sessions.id, id));
}

// アクション関連
export async function getActionsByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(actions).where(eq(actions.studentId, studentId)).orderBy(desc(actions.createdAt));
}

export async function createAction(data: InsertAction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(actions).values(data) as any;
  return Number(result.insertId);
}

export async function updateAction(id: number, data: Partial<InsertAction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(actions).set(data).where(eq(actions.id, id));
}

export async function deleteAction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(actions).where(eq(actions.id, id));
}

export async function toggleActionComplete(id: number, completed: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(actions).set({ 
    completed: completed ? 1 : 0,
    completedAt: completed ? new Date() : null
  }).where(eq(actions.id, id));
}

// 週次メモ関連
export async function getWeeklyMemosByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(weeklyMemos).where(eq(weeklyMemos.studentId, studentId)).orderBy(desc(weeklyMemos.weekStartDate));
}

export async function createWeeklyMemo(data: InsertWeeklyMemo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(weeklyMemos).values(data) as any;
  return Number(result.insertId);
}

export async function updateWeeklyMemo(id: number, data: Partial<InsertWeeklyMemo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(weeklyMemos).set(data).where(eq(weeklyMemos.id, id));
}

export async function deleteWeeklyMemo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(weeklyMemos).where(eq(weeklyMemos.id, id));
}
