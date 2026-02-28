import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 受講生テーブル
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  supportDeadline: date("supportDeadline"),
  guaranteeDeadline: date("guaranteeDeadline"),
  memo: text("memo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * 学習プランマスタテーブル
 */
export const learningPlans = mysqlTable("learningPlans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearningPlan = typeof learningPlans.$inferSelect;
export type InsertLearningPlan = typeof learningPlans.$inferInsert;

/**
 * 学習ステップテーブル（プランに紐づく）
 */
export const learningSteps = mysqlTable("learningSteps", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  stepOrder: int("stepOrder").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  estimatedDays: int("estimatedDays"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearningStep = typeof learningSteps.$inferSelect;
export type InsertLearningStep = typeof learningSteps.$inferInsert;

/**
 * 受講生プラン進捗テーブル
 */
export const studentProgress = mysqlTable("studentProgress", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  planId: int("planId").notNull(),
  currentStepId: int("currentStepId"),
  status: mysqlEnum("status", ["on_track", "behind", "ahead"]).default("on_track").notNull(),
  nextActionTitle: varchar("nextActionTitle", { length: 255 }),
  nextActionDeadline: date("nextActionDeadline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = typeof studentProgress.$inferInsert;

/**
 * ナレッジテーブル
 */
export const knowledgeBase = mysqlTable("knowledgeBase", {
  id: int("id").autoincrement().primaryKey(),
  stepId: int("stepId"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Knowledge = typeof knowledgeBase.$inferSelect;
export type InsertKnowledge = typeof knowledgeBase.$inferInsert;

/**
 * セッション記録テーブル
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  sessionDate: date("sessionDate").notNull(),
  theme: varchar("theme", { length: 255 }),
  memo: text("memo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * アクションテーブル
 */
export const actions = mysqlTable("actions", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  content: text("content").notNull(),
  completed: int("completed").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Action = typeof actions.$inferSelect;
export type InsertAction = typeof actions.$inferInsert;

/**
 * 週次メモテーブル
 */
export const weeklyMemos = mysqlTable("weeklyMemos", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  weekStartDate: date("weekStartDate").notNull(),
  memo: text("memo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeeklyMemo = typeof weeklyMemos.$inferSelect;
export type InsertWeeklyMemo = typeof weeklyMemos.$inferInsert;
