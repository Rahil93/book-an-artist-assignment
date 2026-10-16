
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import dotenv from "dotenv";
dotenv.config({
    path: './.env'
})

const mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export const db = drizzle(mysqlPool);

export async function connectMySQL() {
    const connection = await mysqlPool.getConnection();

    try {
        await connection.query("SELECT 1");
        console.log("MySQL connected successfully");
    } finally {
        connection.release();
    }
}

export default mysqlPool;
