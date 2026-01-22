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
 *             type: object
 *             required:
 *               - complaintId
 *               - content
 *             properties:
 *               complaintId:
 *                 type: string
 *                 format: uuid
 *               content:
 *                 type: string
 *               isVisible:
 *                 type: boolean
 *               file:
 *                 type: string
 *                 format: binary
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
 *     summary: List all responses (paginated)
 *     tags: [Responses]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/SizeQuery'
 *     responses:
 *       200:
 *         description: Paginated collection of responses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponses'
 *
 * /api/v1/response/me:
 *   get:
 *     summary: List responses authored by logged-in user (paginated)
 *     tags: [Responses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/SizeQuery'
 *     responses:
 *       200:
 *         description: Paginated collection of responses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponses'
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
 *     summary: List responses for a complaint (paginated)
 *     tags: [Responses]
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/SizeQuery'
 *     responses:
 *       200:
 *         description: Paginated collection of responses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponses'
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
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: Response details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *   patch:
 *     summary: Update a response
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
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               isVisible:
 *                 type: boolean
 *               file:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateResponseInput'
 *     responses:
 *       200:
 *         description: Response updated
 *   delete:
 *     summary: Delete a response
 *     tags: [Responses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
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
router.get("/",  getAllResponses);
router.get("/me", authenticate, ensureAccountNotDisabled, getUserResponses);
router.get(
  "/complaint/:id",
  getComplaintResponses
);
router.get(
  "/:id",
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