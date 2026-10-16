import { validateSignInUser } from "../validators/auth.validator.js";
import { login } from "../controllers/auth.controller.js";
import { Router } from "express";

const router = Router();

router.route("/login").post(validateSignInUser ,login);

export default router;