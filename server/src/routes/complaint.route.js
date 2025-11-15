import { Router } from "express";
import {
  createComplaint,
  getComplaintDetailsById,
  getAllComplaints,
  getUserComplaints,
  updateComplaint,
  deleteComplaint,
} from "../controllers/complaint.controller.js";
import { uploadsingle } from "../middlewares/cloudinary.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  ensureAccountNotDisabled,
  ensureWritableAccount,
  requireStaffOrAdmin,
} from "../middlewares/authorization.middleware.js";

const router = Router();

// prefix is /complaint
router.post(
  "/",
  authenticate,
  ensureWritableAccount,
  ...uploadsingle("file"),
  createComplaint
);
router.get("/", authenticate, requireStaffOrAdmin, getAllComplaints);
router.get("/me", authenticate, ensureAccountNotDisabled, getUserComplaints);
router.get("/:id", authenticate, ensureAccountNotDisabled, getComplaintDetailsById);
router.patch(
  "/:id",
  authenticate,
  ensureWritableAccount,
  ...uploadsingle("file"),
  updateComplaint
);
router.delete("/:id", authenticate, requireStaffOrAdmin, deleteComplaint);

export default router;
