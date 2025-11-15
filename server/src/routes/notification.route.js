/**
 * @openapi
 * /api/v1/notification:
 *   post:
 *     summary: Create a notification (staff/admin)
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationInput'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationInput'
 *     responses:
 *       201:
 *         description: Notification created
 *   get:
 *     summary: List all notifications
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications list
 *   patch:
 *     summary: Create/update notification via PATCH (staff/admin)
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SourceQuery'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationInput'
 *     responses:
 *       200:
 *         description: Upserted notification
 *
 * /api/v1/notification/domain/{domain}:
 *   parameters:
 *     - in: path
 *       name: domain
 *       required: true
 *       schema:
 *         type: string
 *   get:
 *     summary: List notifications for a domain
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Domain notifications
 *
 * /api/v1/notification/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Notification ID
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notification details
 *   put:
 *     summary: Update notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationInput'
 *     responses:
 *       200:
 *         description: Notification updated
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notification deleted
 */
import { Router } from "express";
import { uploadsingle } from "../middlewares/cloudinary.middleware.js";

import {
    createNotificationController,
    getNotificationByIdController,
    getNotificationByDomainController,
    getAllNotificationsController,
    deleteNotificationByIdController,
    updateNotificationByIdController,
} from "../controllers/notification.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import {
    ensureAccountNotDisabled,
    ensureWritableAccount,
    requireStaffOrAdmin,
} from "../middlewares/authorization.middleware.js";

const router = Router();

router
    .route("/")
    .post(
        authenticate,
        ensureWritableAccount,
        requireStaffOrAdmin,
        ...uploadsingle("file"),
        createNotificationController
    )
    .get(authenticate, ensureAccountNotDisabled, getAllNotificationsController)
    .patch(
        authenticate,
        ensureWritableAccount,
        requireStaffOrAdmin,
        ...uploadsingle("file"),
        createNotificationController
    );

router
    .route("/domain/:domain")
    .get(authenticate, ensureAccountNotDisabled, getNotificationByDomainController);

router
    .route("/:id")
    .get(authenticate, ensureAccountNotDisabled, getNotificationByIdController)
    .put(
        authenticate,
        ensureWritableAccount,
        requireStaffOrAdmin,
        updateNotificationByIdController
    )
    .delete(
        authenticate,
        ensureWritableAccount,
        requireStaffOrAdmin,
        deleteNotificationByIdController
    );

export default router;