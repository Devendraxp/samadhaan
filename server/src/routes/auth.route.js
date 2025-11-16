/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     description: Append `?source=web` when invoking from the browser to receive authentication cookies.
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     description: Append `?source=web` when invoking from the browser to receive authentication cookies.
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

import {Router} from "express";
import { login, register, logout } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
const router = Router();


router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(authenticate, logout);



export default router;