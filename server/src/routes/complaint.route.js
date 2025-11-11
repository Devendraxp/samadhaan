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

const router = Router();

// Order matters: /me before /:id
router.post("/", authenticate, ...uploadsingle("file"), createComplaint);
router.get("/", authenticate, getAllComplaints);
router.get("/me", authenticate, getUserComplaints);
router.get("/:id", authenticate, getComplaintDetailsById);
router.patch("/:id", authenticate, ...uploadsingle("file"), updateComplaint);
router.delete("/:id", authenticate, deleteComplaint);

export default router;
