import authenticateUser from "../middlewares/authenticateUser.middleware.js";
import { getArtistReview } from "../controllers/artist.controller.js";
import { Router } from "express";

const router = Router();

router.route("/:id/reviews").get(authenticateUser, getArtistReview);

export default router;