import { desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  ApiUsage,
  InsertApiUsage,
  InsertUser,
  apiUsage,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
      values.role = "admin";
      updateSet.role = "admin";
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

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function recordApiUsage(record: InsertApiUsage): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(apiUsage).values(record);
}

export async function getApiUsageSummary(since: Date) {
  const db = await getDb();
  if (!db)
    return {
      totalRequests: 0,
      successfulRequests: 0,
      generatedRequests: 0,
      averageLatencyMs: 0,
      latest: [] as ApiUsage[],
    };

  const [summary] = await db
    .select({
      totalRequests: sql<number>`count(*)`,
      successfulRequests: sql<number>`sum(case when ${apiUsage.statusCode} < 400 then 1 else 0 end)`,
      generatedRequests: sql<number>`sum(case when ${apiUsage.generated} = 'yes' then 1 else 0 end)`,
      averageLatencyMs: sql<number>`coalesce(avg(${apiUsage.latencyMs}), 0)`,
    })
    .from(apiUsage)
    .where(gte(apiUsage.createdAt, since));
  const latest = await db
    .select()
    .from(apiUsage)
    .where(gte(apiUsage.createdAt, since))
    .orderBy(desc(apiUsage.createdAt))
    .limit(25);
  return {
    totalRequests: Number(summary?.totalRequests ?? 0),
    successfulRequests: Number(summary?.successfulRequests ?? 0),
    generatedRequests: Number(summary?.generatedRequests ?? 0),
    averageLatencyMs: Math.round(Number(summary?.averageLatencyMs ?? 0)),
    latest,
  };
}
