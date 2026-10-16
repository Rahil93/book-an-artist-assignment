import {
    mysqlTable,
    int,
    varchar,
    char,
    mysqlEnum,
    datetime,
    decimal,
    timestamp,
    index,
} from "drizzle-orm/mysql-core";

export const USER_ROLES = ["artist", "client"];
export const BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "completed", "in-progress"];
export const PAYMENT_STATUSES = ["pending", "completed", "failed", "refunded"];

// `password` stores the bcrypt hash, never the plain text.
export const users = mysqlTable("users", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey(),
    firstName: varchar("firstName", { length: 100 }).notNull(),
    lastName: varchar("lastName", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: mysqlEnum("role", USER_ROLES).notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
});

export const bookings = mysqlTable(
    "bookings",
    {
        id: int("id", { unsigned: true }).autoincrement().primaryKey(),
        artistId: int("artist_id", { unsigned: true }).notNull().references(() => users.id),
        clientId: int("client_id", { unsigned: true }).notNull().references(() => users.id),
        status: mysqlEnum("status", BOOKING_STATUSES).notNull().default("pending"),
        eventStart: datetime("event_start").notNull(),
        eventEnd: datetime("event_end").notNull(),
        notes: varchar("notes", { length: 255 }),
        amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
        currency: char("currency", { length: 3 }).notNull().default("INR"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
    },
    (t) => [
        index("idx_bookings_artist_event").on(t.artistId, t.eventStart),
        index("idx_bookings_client").on(t.clientId),
    ]
);

export const payments = mysqlTable(
    "payments",
    {
        id: int("id", { unsigned: true }).autoincrement().primaryKey(),
        amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
        currency: char("currency", { length: 3 }).notNull().default("INR"),
        status: mysqlEnum("status", PAYMENT_STATUSES).notNull().default("pending"),
        paymentDate: datetime("payment_date"),
        paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
        transactionId: varchar("transaction_id", { length: 255 }).unique(),
        paidBy: int("paid_by", { unsigned: true }).notNull().references(() => users.id),
        paidTo: int("paid_to", { unsigned: true }).notNull().references(() => users.id),
        bookingId: int("booking_id", { unsigned: true }).notNull().references(() => bookings.id),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
    },
    (t) => [index("idx_payments_booking").on(t.bookingId)]
);
