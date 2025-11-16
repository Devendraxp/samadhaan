import * as complaintService from "../services/complaint.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { STAFF_ROLES } from "../middlewares/authorization.middleware.js";

const isStaffRole = (role) => role === "ADMIN" || STAFF_ROLES.includes(role);

const requireViewer = (req) => {
  if (!req.user?.sub) {
    throw new ApiError(401, "Unauthorized");
  }
  return req.user;
};

const getOptionalViewer = (req) => req.user ?? null;

const ensureCanManageComplaint = (complaint, viewer) => {
  if (!viewer) {
    throw new ApiError(401, "Unauthorized");
  }
  if (isStaffRole(viewer.role)) {
    return true;
  }
  if (complaint.complainerId === viewer.sub) {
    return true;
  }
  throw new ApiError(403, "You are not allowed to modify this complaint.");
};

const sanitizeComplaint = (complaint, viewer) => {
  if (!complaint) return complaint;
  const sanitized = { ...complaint };
  const viewerId = viewer?.sub;
  const privilegedViewer = viewer ? isStaffRole(viewer.role) : false;

  if (
    sanitized.anonymous &&
    sanitized.complainerId &&
    !privilegedViewer &&
    sanitized.complainerId !== viewerId
  ) {
    sanitized.complainer = undefined;
  }

  if (Object.prototype.hasOwnProperty.call(sanitized, "complainerId")) {
    delete sanitized.complainerId;
  }

  return sanitized;
};

const sanitizeComplaints = (payload, viewer) => {
  if (Array.isArray(payload)) {
    return payload.map((complaint) => sanitizeComplaint(complaint, viewer));
  }
  return sanitizeComplaint(payload, viewer);
};

const createComplaint = async (req, res, next) => {
  try {
    const { subject, description, mediaLink, domain, } = req.body || {};
    const anonymous = req.body.anonymous === "true";
    if (!subject || !description || !domain) {
      throw new ApiError(400, "Provide all required fields: subject, description, domain");
    }

    const complainerId = req.user?.sub;
    if (!complainerId) {
      throw new ApiError(401, "Unauthorized");
    }

    const payload = {
      subject,
      description,
      mediaLink,
      domain,
      complainerId,
      anonymous: Boolean(anonymous),
    };
    console.log("working till here")

    const created = await complaintService.createComplaint(payload);
    const sanitized = sanitizeComplaint(created, req.user);

    return res
      .status(201)
      .json(new ApiResponse(201, sanitized, "Complaint created successfully."));
  } catch (error) {
    return next(error);
  }
};

const getComplaintDetailsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ApiError(400, "Complaint id is required");
    }

  const viewer = getOptionalViewer(req);
  const details = await complaintService.getComplaintDetailsById(id);
  const sanitized = sanitizeComplaint(details, viewer);

    return res
      .status(200)
      .json(new ApiResponse(200, sanitized, "Complaint details fetched."));
  } catch (error) {
    return next(error);
  }
};

const getAllComplaints = async (req, res, next) => {
  try {
    const viewer = getOptionalViewer(req);
    const complaints = await complaintService.getAllComplaints();
    const sanitized = sanitizeComplaints(complaints, viewer);
    return res
      .status(200)
      .json(new ApiResponse(200, sanitized, "All complaints fetched."));
  } catch (error) {
    return next(error);
  }
};

const getUserComplaints = async (req, res, next) => {
  try {
    const complainerId = req.user?.sub;
    if (!complainerId) {
      throw new ApiError(401, "Unauthorized");
    }

    const complaints = await complaintService.getUserComplaints(complainerId);
    const sanitized = sanitizeComplaints(complaints, req.user);

    return res
      .status(200)
      .json(new ApiResponse(200, sanitized, "User complaints fetched."));
  } catch (error) {
    return next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  try {
    const { id: paramId } = req.params;
    const { id: bodyId, ...rest } = req.body || {};
    const id = paramId || bodyId;

    if (!id) {
      throw new ApiError(400, "Complaint id is required for update");
    }

    const viewer = requireViewer(req);
    const existingComplaint = await complaintService.getComplaintDetailsById(id);
    ensureCanManageComplaint(existingComplaint, viewer);

    const payload = { id, ...rest };
    const updated = await complaintService.updateComplaint(payload);
    const sanitized = sanitizeComplaint(updated, viewer);

    return res
      .status(200)
      .json(new ApiResponse(200, sanitized, "Complaint updated."));
  } catch (error) {
    return next(error);
  }
};

const deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ApiError(400, "Complaint id is required for deletion");
    }

  requireViewer(req);
  const result = await complaintService.deleteComplaint(id);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Complaint deleted."));
  } catch (error) {
    return next(error);
  }
};

export {
  createComplaint,
  getComplaintDetailsById,
  getAllComplaints,
  getUserComplaints,
  updateComplaint,
  deleteComplaint,
};
