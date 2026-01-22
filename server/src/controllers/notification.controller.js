import {
  createNotification,
  getNotificationById,
  getNotificationByDomain,
  getAllNotifications,
  deleteNotificationById,
  updateNotification,
} from "../services/notification.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parsePaginationParams, buildPaginatedResponse } from "../utils/pagination.js";

const createNotificationController = async (req, res) => {
  const { title, description, type, domain, mediaLink } = req.body;

  const userId = req.user.sub;
  if (!title || !description || !type) {
    return res.status(400).json(new ApiResponse(400, null, "Missing required fields."));
  }
  const payload = {
    title,
    description,
    type,
    domain,
    mediaLink,
    userId,
  };

  const notification = await createNotification(payload);
  return res.status(201).json(new ApiResponse(201, notification, "Notification created successfully."));
};

const getNotificationByIdController = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json(new ApiResponse(400, null, "Notification ID is required."));
  }

  const notification = await getNotificationById(id);
  return res.status(200).json(new ApiResponse(200, notification, "Notification fetched successfully."));
};

const getNotificationByDomainController = async (req, res) => {
  const { domain } = req.params;
  if (!domain) {
    return res.status(400).json(new ApiResponse(400, null, "Domain is required."));
  }

  const { page, size, skip } = parsePaginationParams(req.query);
  const { notifications, total } = await getNotificationByDomain(domain, { skip, size });
  const paginated = buildPaginatedResponse(notifications, total, page, size);

  return res.status(200).json(new ApiResponse(200, paginated, "Notification fetched successfully."));
};

const getAllNotificationsController = async (req, res) => {
  const { page, size, skip } = parsePaginationParams(req.query);
  const { notifications, total } = await getAllNotifications({ skip, size });
  const paginated = buildPaginatedResponse(notifications, total, page, size);

  return res.status(200).json(new ApiResponse(200, paginated, "All notifications fetched successfully."));
};

const deleteNotificationByIdController = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json(new ApiResponse(400, null, "Notification ID is required."));
  }

  const deleteNotification = await deleteNotificationById(id);

  res.status(200).json(new ApiResponse(200, deleteNotification, "Notification deleted successfully."));
};

const updateNotificationByIdController = async (req, res) => {
  const { id } = req.params;
  const { title, description, type, domain, mediaLink } = req.body;

  if (!id) {
    return res.status(400).json(new ApiResponse(400, null, "Notification ID is required."));
  }

  const payload = {
    title,
    description,
    type,
    domain,
    mediaLink,
  };
  const updatedNotification = await updateNotification(id, payload);
  return res.status(200).json(new ApiResponse(200, updatedNotification, "Notification updated successfully."));
};

export {
  createNotificationController,
  getNotificationByIdController,
  getNotificationByDomainController,
  getAllNotificationsController,
  deleteNotificationByIdController,
  updateNotificationByIdController,
};