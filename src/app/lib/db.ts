import sql from "mssql";

const config: sql.config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "StudentChatBot",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "YourPassword123",
  port: parseInt(process.env.DB_PORT || "1433"),
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT !== "false",
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || "10"),
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;
let poolPromise: Promise<sql.ConnectionPool> | null = null;

export async function connectToDB(): Promise<sql.ConnectionPool> {
  if (pool?.connected) return pool;

  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((connectedPool) => {
        pool = connectedPool;
        console.log("✅ Connected to SQL Server");
        pool.on("error", (error) => {
          console.error("SQL pool error:", error);
          pool = null;
          poolPromise = null;
        });
        return connectedPool;
      })
      .catch((error) => {
        pool = null;
        poolPromise = null;
        throw error;
      });
  }

  return poolPromise;
}

export async function executeQuery(
  query: string,
  params?: { name: string; type: any; value: any }[]
): Promise<sql.IResult<any>> {
  const pool = await connectToDB();
  const request = pool.request();

  if (params) {
    for (const param of params) {
      request.input(param.name, param.type, param.value);
    }
  }

  return request.query(query);
}
