import * as complaintService from "../services/complaint.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    return res
      .status(201)
      .json(new ApiResponse(201, created, "Complaint created successfully."));
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

    const details = await complaintService.getComplaintDetailsById(id);

    return res
      .status(200)
      .json(new ApiResponse(200, details, "Complaint details fetched."));
  } catch (error) {
    return next(error);
  }
};

const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await complaintService.getAllComplaints();
    return res
      .status(200)
      .json(new ApiResponse(200, complaints, "All complaints fetched."));
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

    return res
      .status(200)
      .json(new ApiResponse(200, complaints, "User complaints fetched."));
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

    const complainerId = req.user?.sub;
    if (!complainerId) {
      throw new ApiError(401, "Unauthorized");
    }

    const payload = { id, ...rest, complainerId };
    const updated = await complaintService.updateComplaint(payload);

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Complaint updated."));
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
