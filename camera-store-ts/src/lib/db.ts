import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as { pool: mysql.Pool | undefined };

export function getPool() {
  if (!globalForDb.pool) {
    const useSsl =
      process.env.DB_SSL === "true" ||
      process.env.DB_SSL === "1" ||
      (process.env.DB_HOST || "").includes("aivencloud.com") ||
      (process.env.DB_HOST || "").includes("aiven.io");

    globalForDb.pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "camera_shop",
      waitForConnections: true,
      connectionLimit: 5,
      charset: "utf8mb4",
      connectTimeout: 15000,
      // Aiven / cloud MySQL bắt buộc SSL
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalForDb.pool;
}

export async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function queryOne<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
