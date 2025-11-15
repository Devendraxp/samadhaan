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