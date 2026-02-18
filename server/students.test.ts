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

describe("students router", () => {
  it("should create a student", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.students.create({
      name: "山田太郎",
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      memo: "初級コース",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should list students", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const students = await caller.students.list();

    expect(Array.isArray(students)).toBe(true);
  });
});
