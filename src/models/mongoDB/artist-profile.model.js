import mongoose from "mongoose";

const artistProfileSchema = new mongoose.Schema(
    {
        // References users.id in MySQL (no Mongo ref possible across databases)
        artist_id: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        bio: {
            type: String,
            trim: true,
        },
        location: {
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            country: { type: String, trim: true },
            address_line_1: { type: String, trim: true },
            address_line_2: { type: String, trim: true },
        },
    },
    { timestamps: true }
);

export const ArtistProfile = mongoose.model("ArtistProfile", artistProfileSchema);
