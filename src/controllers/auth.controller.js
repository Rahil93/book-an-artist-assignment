import { Authentication } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

const login = asyncHandler(async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(new ApiError(400, "Something went wrong", errors.array()));
        }

        const data = await Authentication.loggedIn(req);

        res.status(200).json(new ApiResponse(200, data, 'Login successfully'));
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error?.message);
    }
})

export { login }