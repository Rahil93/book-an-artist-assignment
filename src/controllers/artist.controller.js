import { asyncHandler } from "../utils/asyncHandler.js";
import { Artist } from "../services/artist.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const getArtistReview = asyncHandler(async (req, res) => {
    try {
        const data = await Artist.getArtistReview(req);

        res.status(200).json(new ApiResponse(200, data, 'Review fetched successfully.'));
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error?.message);
    }
})

//I have added on mongoDB query to get top artists, futher we can filter and added artist details by
// fetching from users and bookings table and then associate them with reviews
export const getTopArtistsForLeaderboard = asyncHandler(async (req, res) => {
    try {
        const data = await Artist.getTopArtistsForLeaderboard(req);

        res.status(200).json(new ApiResponse(200, data, 'Review fetched successfully.'));
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error?.message);
    }
})