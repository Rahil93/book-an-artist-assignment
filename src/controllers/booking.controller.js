import { Booking } from "../services/booking.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const createABooking = asyncHandler(async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(new ApiError(400, "Something went wrong", errors.array()));
        }

        const data = await Booking.postABooking(req);

        res.status(200).json(new ApiResponse(200, data, 'Booking created successfully.'));
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error?.message);
    }
})

export const updateBookingStatus = asyncHandler(async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(new ApiError(422, "Something went wrong", errors.array()));
        }

        const data = await Booking.patchStatus(req);

        res.status(200).json(new ApiResponse(200, data, 'Booking status updated successfully.'));
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error?.message);
    }
})