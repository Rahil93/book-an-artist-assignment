import bcrypt from "bcrypt";
import mysqlPool, { db, connectMySQL } from "../db/mysql.js";
import { runMigrations } from "../db/migrate.js";
import mongoose, { connectMongoDB } from "../db/mongodb.js";
import { users, bookings, payments } from "../models/mySQL/schema.js";
import { ArtistProfile } from "../models/mongoDB/artist-profile.model.js";
import { Review } from "../models/mongoDB/review.model.js";

const SEED_PASSWORD = "Password@123";

const artists = [
    { firstName: "Aarav", lastName: "Sharma", email: "aarav.artist@example.com" },
    { firstName: "Meera", lastName: "Iyer", email: "meera.artist@example.com" },
    { firstName: "Kabir", lastName: "Singh", email: "kabir.artist@example.com" },
];

const clients = [
    { firstName: "Priya", lastName: "Patel", email: "priya.client@example.com" },
    { firstName: "Rohan", lastName: "Mehta", email: "rohan.client@example.com" },
    { firstName: "Ananya", lastName: "Gupta", email: "ananya.client@example.com" },
];

const profiles = [
    {
        category: "Singer",
        bio: "Live vocalist for weddings and corporate events.",
        location: { city: "Mumbai", state: "Maharashtra", country: "India", address_line_1: "12 Marine Drive" },
    },
    {
        category: "Dancer",
        bio: "Classical and contemporary dance performances.",
        location: { city: "Chennai", state: "Tamil Nadu", country: "India", address_line_1: "45 Anna Salai" },
    },
    {
        category: "DJ",
        bio: "Club and party DJ with 8 years of experience.",
        location: { city: "Delhi", state: "Delhi", country: "India", address_line_1: "7 Connaught Place" },
    },
];

const daysFromNow = (days, hour = 18) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d;
};
const hoursAfter = (date, hours) => new Date(date.getTime() + hours * 3600 * 1000);

// artist/client are indexes into the arrays above.
const bookingSpecs = [
    { artist: 0, client: 0, status: "completed", start: daysFromNow(-30), hours: 3, notes: "This is a test booking", amount: 25000, payment: "completed", review: { rating: 5, comment: "Fantastic performance, guests loved it." } },
    { artist: 1, client: 1, status: "completed", start: daysFromNow(-20), hours: 2, notes: "This is a test booking", amount: 18000, payment: "completed", review: { rating: 4, comment: "Great show, slightly late to start." } },
    { artist: 2, client: 2, status: "completed", start: daysFromNow(-10), hours: 4, notes: "This is a test booking", amount: 30000, payment: "completed", review: { rating: 5, comment: "Kept the dance floor full all night." } },
    { artist: 0, client: 1, status: "confirmed", start: daysFromNow(7), hours: 3, notes: "This is a test booking", amount: 22000, payment: "pending" },
    { artist: 1, client: 2, status: "pending", start: daysFromNow(14), hours: 2, notes: "This is a test booking", amount: 15000, payment: null },
    { artist: 2, client: 0, status: "cancelled", start: daysFromNow(21), hours: 3, notes: "This is a test booking", amount: 28000, payment: "refunded" },
];

const PAYMENT_METHODS = ["upi", "card", "net_banking"];

async function resetData() {
    // TRUNCATE is blocked by FKs, so disable the check on one dedicated connection.
    const conn = await mysqlPool.getConnection();
    try {
        await conn.query("SET FOREIGN_KEY_CHECKS = 0");
        for (const table of ["payments", "bookings", "users"]) {
            await conn.query(`TRUNCATE TABLE ${table}`);
        }
        await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    } finally {
        conn.release();
    }
    await Promise.all([ArtistProfile.deleteMany({}), Review.deleteMany({})]);
}

async function insertUsers(list, role, passwordHash) {
    const ids = [];
    for (const u of list) {
        const [result] = await db.insert(users).values({ ...u, password: passwordHash, role });
        ids.push(result.insertId);
    }
    return ids;
}

async function seed() {
    await Promise.all([connectMySQL(), connectMongoDB()]);

    await runMigrations();
    await resetData();

    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    const artistIds = await insertUsers(artists, "artist", passwordHash);
    const clientIds = await insertUsers(clients, "client", passwordHash);

    await ArtistProfile.insertMany(
        profiles.map((p, i) => ({ artist_id: artistIds[i], ...p }))
    );

    const reviews = [];
    let paymentCount = 0;

    for (const [i, b] of bookingSpecs.entries()) {
        const artistId = artistIds[b.artist];
        const clientId = clientIds[b.client];
        const end = hoursAfter(b.start, b.hours);

        const [booking] = await db.insert(bookings).values({
            artistId,
            clientId,
            status: b.status,
            eventStart: b.start,
            eventEnd: end,
            amount: String(b.amount),
            notes: b.notes,
        });

        if (b.payment) {
            const paid = b.payment === "completed" || b.payment === "refunded";
            await db.insert(payments).values({
                amount: String(b.amount),
                status: b.payment,
                paymentDate: paid ? new Date() : null,
                paymentMethod: PAYMENT_METHODS[i % PAYMENT_METHODS.length],
                transactionId: paid ? `TXN-SEED-${String(i + 1).padStart(4, "0")}` : null,
                paidBy: clientId,
                paidTo: artistId,
                bookingId: booking.insertId,
            });
            paymentCount++;
        }

        if (b.review) {
            reviews.push({
                ...b.review,
                client_id: clientId,
                artist_id: artistId,
                booking_id: booking.insertId,
            });
        }
    }

    await Review.insertMany(reviews);

    console.log(
        `Seeded MySQL: ${artists.length + clients.length} users, ${bookingSpecs.length} bookings, ${paymentCount} payments`
    );
    console.log(`Seeded MongoDB: ${profiles.length} artist profiles, ${reviews.length} reviews`);
    console.log(`Seed users log in with password: ${SEED_PASSWORD}`);
}

try {
    await seed();
} catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
} finally {
    await Promise.allSettled([mysqlPool.end(), mongoose.disconnect()]);
}
