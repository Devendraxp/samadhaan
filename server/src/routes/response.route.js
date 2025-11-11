import { Router } from "express";
import {
  createResponse,
  getResponseDetailsById,
  getAllResponses,
  getComplaintResponses,
  getUserResponses,
  updateResponse,
  deleteResponse,
} from "../controllers/response.controller.js";
import { uploadsingle } from "../middlewares/cloudinary.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticate, ...uploadsingle("file"), createResponse);
router.get("/", authenticate, getAllResponses);
router.get("/me", authenticate, getUserResponses);
router.get("/complaint/:id", authenticate, getComplaintResponses);
router.get("/:id", authenticate, getResponseDetailsById);
router.patch("/:id", authenticate, ...uploadsingle("file"), updateResponse);
router.delete("/:id", authenticate, deleteResponse);

export default router;