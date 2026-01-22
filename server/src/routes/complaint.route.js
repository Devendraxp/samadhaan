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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *               - domain
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               domain:
 *                 type: string
 *               anonymous:
 *                 type: string
 *                 enum: ["true", "false"]
 *               file:
 *                 type: string
 *                 format: binary
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
 *     summary: List all complaints (paginated)
 *     tags: [Complaints]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/SizeQuery'
 *     responses:
 *       200:
 *         description: Paginated complaints collection
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedComplaints'
 *
 * /api/v1/complaint/me:
 *   get:
 *     summary: List complaints created by the logged-in user (paginated)
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/SizeQuery'
 *     responses:
 *       200:
 *         description: Paginated complaints collection
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedComplaints'
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
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: Complaint details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               domain:
 *                 type: string
 *               status:
 *                 type: string
 *               anonymous:
 *                 type: string
 *                 enum: ["true", "false"]
 *               file:
 *                 type: string
 *                 format: binary
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
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
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
