import { users } from "../models/mySQL/schema.js";
import { ApiError } from "../utils/ApiError.js";
import { db } from "../db/mysql.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class Authentication {
    static async loggedIn(req) {
        const { email, password } = req.body;

        const [user] = await db
            .select({ id: users.id, password: users.password, role: users.role })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            throw new ApiError(401, 'Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid email or password');
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

        return { token };
    }
}