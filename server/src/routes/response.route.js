/**
 * @openapi
 * /api/v1/response:
 *   post:
 *     summary: Create complaint response
 *     tags: [Responses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateResponseInput'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResponseInput'
 *     responses:
 *       201:
 *         description: Response created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *   get:
 *     summary: List all responses (staff/admin)
 *     tags: [Responses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Collection of responses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Response'
 *
 * /api/v1/response/me:
 *   get:
 *     summary: List responses authored by logged-in user
 *     tags: [Responses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: Collection of responses
 *
 * /api/v1/response/complaint/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Complaint ID
 *   get:
 *     summary: List responses for a complaint
 *     tags: [Responses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: Collection of responses
 *
 * /api/v1/response/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Response ID
 *   get:
 *     summary: Get response details
 *     tags: [Responses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: Response details
 *   patch:
 *     summary: Update a response
 *     tags: [Responses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateResponseInput'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResponseInput'
 *     responses:
 *       200:
 *         description: Response updated
 *   delete:
 *     summary: Delete a response
 *     tags: [Responses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Response deleted
 */
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