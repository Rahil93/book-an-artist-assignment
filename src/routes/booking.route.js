import authenticateUser from "../middlewares/authenticateUser.middleware.js";
import { validateBookingReq, validateBookingStatusReq } from "../validators/booking.validator.js";
import authorizeUser from "../middlewares/authorizeUser.middleware.js";
import { createABooking, updateBookingStatus } from "../controllers/booking.controller.js";
import { Router } from "express";

const router = Router();

router.route("").post(authenticateUser, authorizeUser("client"), validateBookingReq, createABooking);

router.route("/:id/status").patch(authenticateUser, validateBookingStatusReq, updateBookingStatus);

export default router;