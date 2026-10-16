import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.ACCESS_TOKEN_SECRET = "test-secret";

// authenticateUser looks the user up in MySQL; stub the query builder chain.
vi.mock("../src/db/mysql.js", () => {
    const chain = {
        from: () => chain,
        where: () => chain,
        limit: () => Promise.resolve([{ id: 1, role: "artist" }]),
    };
    return {
        default: {},
        db: { select: () => chain },
        connectMySQL: vi.fn(),
    };
});

const { default: app } = await import("../src/app.js");

describe("PATCH /bookings/:id/status", () => {
    it("returns 422 with an error message for an invalid status transition", async () => {
        const token = jwt.sign({ id: 1 }, process.env.ACCESS_TOKEN_SECRET);

        const res = await request(app)
            .patch("/bookings/1/status")
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "bogus" });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.errors[0].msg).toBe("Invalid transition of status");
    });
});
