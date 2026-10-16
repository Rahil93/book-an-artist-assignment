import { bookings } from "../models/mySQL/schema.js";
import { and, eq, lt, gt, or } from "drizzle-orm";
import { ApiError } from "../utils/ApiError.js";
import { db } from "../db/mysql.js";

export class Booking {
    static async postABooking(req) {
        const { artist_id, event_start, event_end, amount, notes } = req.body;

        const overlappingBookings = await db
            .select()
            .from(bookings)
            .where(
                and(
                    eq(bookings.artistId, artist_id),
                    eq(bookings.status, "confirmed"),
                    lt(bookings.eventStart, new Date(event_end)),
                    gt(bookings.eventEnd, new Date(event_start))
                )
            );

        if (overlappingBookings.length > 0) {
            throw new ApiError(400, "Artist already has a confirmed booking during this time.");
        }

        const data = await db.insert(bookings).values({
            artistId: artist_id,
            clientId: req.userId,
            eventStart: new Date(event_start),
            eventEnd: new Date(event_end),
            notes,
            amount
        });

        const [booking] = await db
            .select()
            .from(bookings)
            .where(eq(bookings.id, data[0].insertId))
            .limit(1);

        return booking;
    }

    static async patchStatus(req) {
        const { status } = req.body;
        const { id } = req.params;

        if (status === "confirmed") {
            const isArtistBooking = await db
                .select()
                .from(bookings)
                .where(and(eq(bookings.id, id), eq(bookings.artistId, req.userId), eq(bookings.status, "pending")))
                .limit(1);

            if (isArtistBooking.length === 0) {
                throw new ApiError(403, "You are not authorized to update this booking status");
            }
        } else if (status === "cancelled") {
            const isClientBooking = await db
                .select()
                .from(bookings)
                .where(and(eq(bookings.id, id), eq(bookings.clientId, req.userId), or(eq(bookings.status, "pending"), eq(bookings.status, "confirmed"))))
                .limit(1);

            if (isClientBooking.length === 0) {
                throw new ApiError(403, "You are not authorized to update this booking status");
            }
        } else {
            // for status "completed" and "in-progress" as status can been updated by cron job based on date
            // and for status "pending" can been changed when client changed the artist
            throw new ApiError(400, "Invalid status");
        }

        const data = await db
            .update(bookings)
            .set({ status })
            .where(eq(bookings.id, id));

        const [booking] = await db
            .select()
            .from(bookings)
            .where(eq(bookings.id, id))
            .limit(1);

        return booking;
    }
}