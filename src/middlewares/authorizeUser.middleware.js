import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const authorizeUser = (role) => {
  return asyncHandler(async (req, res, next) => {
    try {

      if (req.role === role) {
        return next();
      }

      throw new ApiError(403, `You do not have permission to access this resource.`)
    } catch (error) {
      throw new ApiError(error.statusCode || 500, error?.message || "Internal server error")
    }
  })
}


export default authorizeUser;