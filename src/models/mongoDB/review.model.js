import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
    {
        comment: {
            type: String,
            trim: true,
        },
        // references MySQL users.id
        client_id: {
            type: Number,
            required: true,
            index: true,
        },
        // references MySQL users.id
        artist_id: {
            type: Number,
            required: true,
            index: true,
        },
        // references MySQL bookings.id
        booking_id: {
            type: Number,
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
    },
    { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
