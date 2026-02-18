import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-coach",
    email: "coach@example.com",
    name: "Test Coach",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("learningPlans router", () => {
  it("should create a learning plan", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.learningPlans.create({
      name: "初級コース",
      description: "英会話初心者向けのコース",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should list learning plans", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plans = await caller.learningPlans.list();

    expect(Array.isArray(plans)).toBe(true);
  });
});

describe("learningSteps router", () => {
  it("should create a learning step", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // まずプランを作成
    const plan = await caller.learningPlans.create({
      name: "テストプラン",
      description: "テスト用",
    });

    expect(plan).toHaveProperty("id");
    expect(typeof plan.id).toBe("number");
    expect(plan.id).toBeGreaterThan(0);

    const result = await caller.learningSteps.create({
      planId: plan.id,
      stepOrder: 1,
      title: "基礎文法",
      description: "基本的な文法を学習",
      estimatedDays: 30,
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });
});
