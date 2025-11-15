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
import {
  ensureAccountNotDisabled,
  ensureWritableAccount,
  requireStaffOrAdmin,
} from "../middlewares/authorization.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  ensureWritableAccount,
  ...uploadsingle("file"),
  createResponse
);
router.get("/", authenticate, requireStaffOrAdmin, getAllResponses);
router.get("/me", authenticate, ensureAccountNotDisabled, getUserResponses);
router.get(
  "/complaint/:id",
  authenticate,
  ensureAccountNotDisabled,
  getComplaintResponses
);
router.get(
  "/:id",
  authenticate,
  ensureAccountNotDisabled,
  getResponseDetailsById
);
router.patch(
  "/:id",
  authenticate,
  ensureWritableAccount,
  ...uploadsingle("file"),
  updateResponse
);
router.delete(
  "/:id",
  authenticate,
  ensureWritableAccount,
  deleteResponse
);

export default router;