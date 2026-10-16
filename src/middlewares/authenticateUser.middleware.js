import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { eq } from "drizzle-orm";
import { db } from "../db/mysql.js";
import { users } from "../models/mySQL/schema.js";
import jwt from "jsonwebtoken"

const authenticateUser = asyncHandler(
  async (req, res, next) => {
    const token = req.header("Authorization")?.replace('Bearer ', '') ?? "";

    if (!token) {
      throw new ApiError(401, 'Authentication required')
    }

    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Replace with your JWT secret
      const [user] = await db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.id, decodedToken.id))
        .limit(1);

      if (!user) {
        throw new ApiError(401, 'Invalid Access Token')
      }

      req.userId = user.id;
      req.role = user.role;
      next();
    } catch (error) {
      throw new ApiError(error.statusCode || 401, "Invalid access token")
    }
  }
)

export default authenticateUser