import prisma from "../utils/Prisma.js";
import { ApiError } from "../utils/ApiError.js";

const responseSelect = {
  id: true,
  content: true,
  mediaLink: true,
  isVisible: true,
  createdAt: true,
  updatedAt: true,
  complaintId: true,
  responderId: true,
  responder: { select: { id: true, name: true, email: true, role: true } },
};

const createResponse = async (response) => {
  const { complaintId, content, mediaLink, responderId, isVisible } =
    response || {};

  if (!complaintId) {
    throw new ApiError(400, "Provide complaintId");
  }
  if (!responderId) {
    throw new ApiError(400, "Provide responderId");
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    throw new ApiError(400, "Response content is required");
  }

  const created = await prisma.response.create({
    data: {
      complaint: { connect: { id: complaintId } },
      content: content.trim(),
      mediaLink,
      responder: { connect: { id: responderId } },
      isVisible: typeof isVisible === "boolean" ? isVisible : true,
    },
    select: responseSelect,
  });

  return created;
};

const getResponseDetailsById = async (id) => {
  if (!id) {
    throw new ApiError(400, "response id is required");
  }

  const resp = await prisma.response.findUnique({
    where: { id },
    select: responseSelect,
  });

  if (!resp) {
    throw new ApiError(404, "Response not found");
  }

  return resp;
};

const getAllResponses = async ({ skip, size } = {}) => {
  const [responses, total] = await Promise.all([
    prisma.response.findMany({
      orderBy: { createdAt: "desc" },
      skip: skip ?? 0,
      take: size ?? 10,
      select: responseSelect,
    }),
    prisma.response.count(),
  ]);
  return { responses, total };
};

const getComplaintResponses = async (complaintId, { skip, size } = {}) => {
  if (!complaintId) {
    throw new ApiError(400, "complaintId is required");
  }

  const whereClause = { complaintId };

  const [responses, total] = await Promise.all([
    prisma.response.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      skip: skip ?? 0,
      take: size ?? 10,
      select: responseSelect,
    }),
    prisma.response.count({ where: whereClause }),
  ]);

  return { responses, total };
};

const getUserResponses = async (user, { skip, size } = {}) => {
  if (!user) {
    throw new ApiError(400, "User identifier is required");
  }

  const responderId =
    (typeof user === "string" ? user : null) ||
    user.responderId ||
    user.id ||
    user.sub;

  if (!responderId) {
    throw new ApiError(400, "Authenticated user has no id/responderId");
  }

  const whereClause = { responderId };

  const [responses, total] = await Promise.all([
    prisma.response.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: skip ?? 0,
      take: size ?? 10,
      select: responseSelect,
    }),
    prisma.response.count({ where: whereClause }),
  ]);

  return { responses, total };
};

const updateResponse = async (newResponse) => {
  const { id } = newResponse || {};
  if (!id) {
    throw new ApiError(400, "response id is required for update");
  }

  const existing = await prisma.response.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Response not found");
  }

  const data = {
    content:
      typeof newResponse.content === "string"
        ? newResponse.content
        : existing.content,
    mediaLink:
      typeof newResponse.mediaLink === "string"
        ? newResponse.mediaLink
        : existing.mediaLink,
    isVisible:
      typeof newResponse.isVisible === "boolean"
        ? newResponse.isVisible
        : existing.isVisible,
  };

  if (newResponse.complaintId) {
    data.complaint = { connect: { id: newResponse.complaintId } };
  }
  if (newResponse.responderId) {
    data.responder = { connect: { id: newResponse.responderId } };
  }

  const updated = await prisma.response.update({
    where: { id },
    data,
    select: responseSelect,
  });

  return updated;
};

const deleteResponse = async (id) => {
  if (!id) {
    throw new ApiError(400, "response id is required for deletion");
  }

  const result = await prisma.response.deleteMany({ where: { id } });

  if (result.count === 0) {
    throw new ApiError(404, "Response not found or already deleted");
  }

  return { deleted: true, count: result.count };
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