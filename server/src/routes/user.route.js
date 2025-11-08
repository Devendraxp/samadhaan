import { Router} from "express";
import { getProfile } from "../controllers/auth.controller.js";
import { authenticate } from "..middleware/auth.middleware.js";

const router = Router();

router.route("/profile").get(authenticate, getProfile);

export default router;