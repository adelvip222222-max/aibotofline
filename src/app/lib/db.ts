import sql from "mssql";

const config: sql.config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "StudentChatBot",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "YourPassword123",
  port: parseInt(process.env.DB_PORT || "1433"),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function connectToDB(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }

  pool = await sql.connect(config);
  console.log("✅ Connected to SQL Server");
  return pool;
}

export async function executeQuery(query: string, params?: { name: string; type: any; value: any }[]): Promise<sql.IResult<any>> {
  const pool = await connectToDB();
  const request = pool.request();

  if (params) {
    for (const param of params) {
      request.input(param.name, param.type, param.value);
    }
  }

  return request.query(query);
}