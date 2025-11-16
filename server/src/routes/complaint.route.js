/**
 * @openapi
 * /api/v1/complaint:
 *   post:
 *     summary: Create a complaint
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateComplaintInput'
 *     responses:
 *       201:
 *         description: Complaint created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *   get:
 *     summary: List all complaints (staff/admin)
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Complaints collection
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Complaint'
 *
 * /api/v1/complaint/me:
 *   get:
 *     summary: List complaints created by the logged-in student
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: Complaints collection
 *
 * /api/v1/complaint/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Complaint ID
 *   get:
 *     summary: Get complaint details
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: Complaint details
 *   patch:
 *     summary: Update complaint
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateComplaintInput'
 *     responses:
 *       200:
 *         description: Complaint updated
 *   delete:
 *     summary: Delete complaint (staff/admin)
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Complaint deleted
 */
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


router.post(
  "/",
  authenticate,
  ensureWritableAccount,
  ...uploadsingle("file"),
  createComplaint
);
router.get("/", getAllComplaints);
router.get("/me", authenticate, ensureAccountNotDisabled, getUserComplaints);
router.get("/:id", getComplaintDetailsById);
router.patch(
  "/:id",
  authenticate,
  ensureWritableAccount,
  ...uploadsingle("file"),
  updateComplaint
);
router.delete("/:id", authenticate, requireStaffOrAdmin, deleteComplaint);

export default router;
