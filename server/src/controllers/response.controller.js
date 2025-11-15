import * as responseService from "../services/response.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import prisma from "../utils/Prisma.js";
import { STAFF_ROLES } from "../middlewares/authorization.middleware.js";

const isStaffRole = (role) => role === "ADMIN" || STAFF_ROLES.includes(role);

const requireViewer = (req) => {
  if (!req.user?.sub) {
    throw new ApiError(401, "Unauthorized");
  }
  return req.user;
};

const ensureComplaintAccess = async (complaintId, viewer, errorMessage) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    select: { complainerId: true },
  });

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  if (isStaffRole(viewer.role) || complaint.complainerId === viewer.sub) {
    return true;
  }

  throw new ApiError(403, errorMessage);
};

const ensureCanViewResponse = async (response, viewer) => {
  if (isStaffRole(viewer.role) || response.responderId === viewer.sub) {
    return true;
  }
  await ensureComplaintAccess(
    response.complaintId,
    viewer,
    "You are not allowed to view these responses."
  );
};

const createResponse = async (req, res, next) => {
  try {
    const responderId = req.user?.sub;
    if (!responderId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { complaintId, content, mediaLink, isVisible=true } = req.body || {};
    if (!complaintId) {
      throw new ApiError(400, "complaintId is required");
    }
    if (!content) {
      throw new ApiError(400, "content is required");
    }

    const payload = {
      complaintId: String(complaintId),
      content: content.trim(),
      mediaLink,
      responderId,
      isVisible,
    };

    const created = await responseService.createResponse(payload);
    return res
      .status(201)
      .json(new ApiResponse(201, created, "Response created successfully."));
  } catch (error) {
    return next(error);
  }
};

const getResponseDetailsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw new ApiError(400, "response id is required");

    const viewer = requireViewer(req);
    const details = await responseService.getResponseDetailsById(id);
    await ensureCanViewResponse(details, viewer);
    return res
      .status(200)
      .json(new ApiResponse(200, details, "Response details fetched."));
  } catch (error) {
    return next(error);
  }
};

const getAllResponses = async (req, res, next) => {
  try {
    const responses = await responseService.getAllResponses();
    return res
      .status(200)
      .json(new ApiResponse(200, responses, "All responses fetched."));
  } catch (error) {
    return next(error);
  }
};

const getComplaintResponses = async (req, res, next) => {
  try {
    const { id: complaintId } = req.params;
    if (!complaintId) throw new ApiError(400, "complaintId is required");

    const viewer = requireViewer(req);
    await ensureComplaintAccess(
      complaintId,
      viewer,
      "You are not allowed to view these responses."
    );

    const responses = await responseService.getComplaintResponses(complaintId);
    return res
      .status(200)
      .json(new ApiResponse(200, responses, "Complaint responses fetched."));
  } catch (error) {
    return next(error);
  }
};

const getUserResponses = async (req, res, next) => {
  try {
    const viewer = requireViewer(req);
    const responderId = viewer.sub;

    const responses = await responseService.getUserResponses(responderId);
    return res
      .status(200)
      .json(new ApiResponse(200, responses, "User responses fetched."));
  } catch (error) {
    return next(error);
  }
};

const updateResponse = async (req, res, next) => {
  try {
    const { id: paramId } = req.params;
    const { id: bodyId, ...rest } = req.body || {};
    const id = paramId || bodyId;

    if (!id) throw new ApiError(400, "response id is required for update");

    requireViewer(req);
    const payload = {
      id,
      content:
        typeof rest.content === "string" ? rest.content.trim() : rest.content,
      mediaLink:
        typeof rest.mediaLink === "string"
          ? rest.mediaLink.trim()
          : rest.mediaLink,
      isVisible:
        typeof rest.isVisible === "boolean" ? rest.isVisible : undefined,
      // optionally allow reassignment if provided
      complaintId:
        typeof rest.complaintId === "string" ? rest.complaintId : undefined,
      responderId:
        typeof rest.responderId === "string" ? rest.responderId : undefined,
    };

    const updated = await responseService.updateResponse(payload);
    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Response updated."));
  } catch (error) {
    return next(error);
  }
};

const deleteResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw new ApiError(400, "response id is required for deletion");

    requireViewer(req);
    const result = await responseService.deleteResponse(id);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Response deleted."));
  } catch (error) {
    return next(error);
  }
};

export {
  createResponse,
  getResponseDetailsById,
  getAllResponses,
  getComplaintResponses,
  getUserResponses,
  updateResponse,
  deleteResponse,
};