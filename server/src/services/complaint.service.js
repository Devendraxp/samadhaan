import prisma from "../utils/Prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern, CACHE_TTL } from "../utils/redis.js";

const createComplaint = async (complaint) => {
  const {
    subject,
    description,
    mediaLink,
    domain,
    complainerId,
    anonymous = false,
  } = complaint || {};

  if (!subject || !description || !domain || !complainerId) {
    throw new ApiError(
      400,
      "Provide all required fields: subject, description, domain, complainerId"
    );
  }

  const createdComplaint = await prisma.complaint.create({
    data: {
      subject,
      description,
      mediaLink,
      domain,
      complainer: { connect: { id: complainerId } },
      anonymous: Boolean(anonymous),
    },
    select: {
      id: true,
      subject: true,
      description: true,
      mediaLink: true,
      domain: true,
      anonymous: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      complainerId: true,
      complainer: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  // Cache and invalidate lists
  await cacheSet(`complaint:${createdComplaint.id}`, createdComplaint, CACHE_TTL.COMPLAINT);
  await cacheDeletePattern("complaints:*");

  return createdComplaint;
};

const getComplaintDetailsById = async (complaintId) => {
  if (!complaintId) {
    throw new ApiError(400, "Complaint id is required");
  }

  const cached = await cacheGet(`complaint:${complaintId}`);
  if (cached) return cached;

  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    select: {
      id: true,
      subject: true,
      description: true,
      mediaLink: true,
      domain: true,
      anonymous: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      complainerId: true,
      complainer: {
        select: { id: true, name: true, email: true, role: true },
      },
      responses: {
        select: {
          id: true,
          content: true,
          mediaLink: true,
          createdAt: true,
          responderId: true,
          responder: {
            select: { name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  await cacheSet(`complaint:${complaintId}`, complaint, CACHE_TTL.COMPLAINT);

  return complaint;
};

const getAllComplaints = async ({ skip, size } = {}) => {
  const cacheKey = `complaints:all:${skip ?? 0}:${size ?? 10}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      skip: skip ?? 0,
      take: size ?? 10,
      select: {
        id: true,
        subject: true,
        description: true,
        mediaLink: true,
        domain: true,
        anonymous: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        complainerId: true,
        complainer: { select: { id: true, name: true, email: true, role: true } },
        responses: {
          select: {
            id: true,
            content: true,
            mediaLink: true,
            createdAt: true,
            responderId: true,
            responder: { select: { name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.complaint.count(),
  ]);

  const result = { complaints, total };
  await cacheSet(cacheKey, result, CACHE_TTL.COMPLAINT);

  return result;
};

const getUserComplaints = async (user, { skip, size } = {}) => {
  if (!user) {
    throw new ApiError(400, "User identifier is required");
  }

  const complainerId =
    (typeof user === "string" ? user : null) ||
    user.complainerId ||
    user.id ||
    user.sub;

  if (!complainerId) {
    throw new ApiError(400, "Authenticated user has no id/complainerId");
  }

  const cacheKey = `complaints:user:${complainerId}:${skip ?? 0}:${size ?? 10}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where: { complainerId },
      orderBy: { createdAt: "desc" },
      skip: skip ?? 0,
      take: size ?? 10,
      select: {
        id: true,
        subject: true,
        description: true,
        mediaLink: true,
        domain: true,
        anonymous: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        complainerId: true,
        complainer: { select: { id: true, name: true, email: true, role: true } },
        responses: {
          select: {
            id: true,
            content: true,
            mediaLink: true,
            createdAt: true,
            responderId: true,
            responder: { select: { name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.complaint.count({ where: { complainerId } }),
  ]);

  const result = { complaints, total };
  await cacheSet(cacheKey, result, CACHE_TTL.COMPLAINT);

  return result;
};

const updateComplaint = async (newComplaint) => {
  const { id } = newComplaint || {};
  if (!id) {
    throw new ApiError(400, "Complaint id is required for update");
  }

  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Complaint not found");
  }

  const data = {
    subject: newComplaint.subject ?? existing.subject,
    description: newComplaint.description ?? existing.description,
    mediaLink: newComplaint.mediaLink ?? existing.mediaLink,
    domain: newComplaint.domain ?? existing.domain,
    anonymous:
      typeof newComplaint.anonymous === "boolean"
        ? newComplaint.anonymous
        : existing.anonymous,
    status: newComplaint.status ?? existing.status,
  };

  if (newComplaint.complainerId) {
    data.complainer = { connect: { id: newComplaint.complainerId } };
  }

  const updated = await prisma.complaint.update({
    where: { id },
    data,
    select: {
      id: true,
      subject: true,
      description: true,
      mediaLink: true,
      domain: true,
      anonymous: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      complainerId: true,
      complainer: { select: { id: true, name: true, email: true, role: true } },
      responses: {
        select: {
          id: true,
          content: true,
          mediaLink: true,
          createdAt: true,
          responderId: true,
          responder: {
            select: { name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // Invalidate caches
  await cacheDelete(`complaint:${id}`);
  await cacheDeletePattern("complaints:*");

  return updated;
};

const deleteComplaint = async (complaintId) => {
  if (!complaintId) {
    throw new ApiError(400, "Complaint id is required for deletion");
  }

  const result = await prisma.complaint.deleteMany({
    where: { id: complaintId },
  });

  if (result.count === 0) {
    throw new ApiError(404, "Complaint not found or already deleted");
  }

  // Invalidate caches
  await cacheDelete(`complaint:${complaintId}`);
  await cacheDeletePattern("complaints:*");

  return { deleted: true, count: result.count };
};

export {
  createComplaint,
  getAllComplaints,
  getUserComplaints,
  getComplaintDetailsById,
  updateComplaint,
  deleteComplaint,
};
