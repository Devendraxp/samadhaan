/**
 * @openapi
 * /api/v1/user/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Requires authentication. Append `?source=web` when calling from the browser.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: Authenticated user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   patch:
 *     summary: Update current user profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated profile
 *   delete:
 *     summary: Soft delete current user profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: Profile deleted
 *
 * /api/v1/user:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     summary: Create user (admin only)
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User created
 *
 * /api/v1/user/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       schema:
 *         type: string
 *       required: true
 *       description: Target user ID
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: User details
 *   patch:
 *     summary: Update user (admin only)
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: User deleted
 */
import { Router } from "express";
import {
  // self
  getProfile,
  updateProfile,
  deleteProfile,
  // admin
  listUsers,
  getUser,
  createUser,
  adminUpdateUser,
  adminDeleteUser,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Self profile
router
  .route("/profile")
  .get(authenticate, getProfile)
  .patch(authenticate, updateProfile)
  .delete(authenticate, deleteProfile);

// Admin user management
router
  .route("/")
  .get(authenticate, listUsers)   // list all users (admin check inside controller)
  .post(authenticate, createUser); // create user (admin)

// Single user admin ops (place after /profile to avoid clash)
router
  .route("/:id")
  .get(authenticate, getUser)
  .patch(authenticate, adminUpdateUser)
  .delete(authenticate, adminDeleteUser);

export default router;