import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // 受講生管理
  students: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllStudents();
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getStudentById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        memo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const data = {
          ...input,
          startDate: input.startDate,
          endDate: input.endDate || null,
        };
        const id = await db.createStudent(data as any);
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        memo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateStudent(id, data as any);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteStudent(input.id);
        return { success: true };
      }),
  }),

  // 学習プラン管理
  learningPlans: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllLearningPlans();
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getLearningPlanById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createLearningPlan(input);
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateLearningPlan(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLearningPlan(input.id);
        return { success: true };
      }),
  }),

  // 学習ステップ管理
  learningSteps: router({
    listByPlan: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStepsByPlanId(input.planId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        planId: z.number(),
        stepOrder: z.number(),
        title: z.string(),
        description: z.string().optional(),
        estimatedDays: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createLearningStep(input);
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        stepOrder: z.number().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        estimatedDays: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateLearningStep(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLearningStep(input.id);
        return { success: true };
      }),
  }),

  // 受講生プラン進捗管理
  studentProgress: router({
    get: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProgressByStudentId(input.studentId);
      }),
    
    upsert: protectedProcedure
      .input(z.object({
        id: z.number().optional(),
        studentId: z.number(),
        planId: z.number(),
        currentStepId: z.number().optional(),
        status: z.enum(['on_track', 'behind', 'ahead']).optional(),
        nextActionTitle: z.string().optional(),
        nextActionDeadline: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.upsertStudentProgress(input as any);
        return { id };
      }),
  }),

  // ナレッジ管理
  knowledge: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllKnowledge();
    }),
    
    listByStep: protectedProcedure
      .input(z.object({ stepId: z.number() }))
      .query(async ({ input }) => {
        return await db.getKnowledgeByStepId(input.stepId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        stepId: z.number().optional(),
        title: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createKnowledge(input);
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateKnowledge(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteKnowledge(input.id);
        return { success: true };
      }),
  }),

  // セッション記録管理
  sessions: router({
    listByStudent: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSessionsByStudentId(input.studentId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        studentId: z.number(),
        sessionDate: z.string(),
        theme: z.string().optional(),
        memo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createSession(input as any);
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        sessionDate: z.string().optional(),
        theme: z.string().optional(),
        memo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSession(id, data as any);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSession(input.id);
        return { success: true };
      }),
  }),

  // アクション管理
  actions: router({
    listByStudent: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getActionsByStudentId(input.studentId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        studentId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createAction(input);
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAction(id, data);
        return { success: true };
      }),
    
    toggleComplete: protectedProcedure
      .input(z.object({
        id: z.number(),
        completed: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await db.toggleActionComplete(input.id, input.completed);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAction(input.id);
        return { success: true };
      }),
  }),

  // 週次メモ管理
  weeklyMemos: router({
    listByStudent: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getWeeklyMemosByStudentId(input.studentId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        studentId: z.number(),
        weekStartDate: z.string(),
        memo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createWeeklyMemo(input as any);
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        memo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateWeeklyMemo(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteWeeklyMemo(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
