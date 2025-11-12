import prisma from "../utils/Prisma.js";
import { createResponse } from "./response.service.js";
import { ApiError } from "../utils/ApiError.js";

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
      complainer: { select: { name: true, email: true, role: true } },
    },
  });

  return createdComplaint;
};

const getComplaintDetailsById = async (complaintId) => {
  if (!complaintId) {
    throw new ApiError(400, "Complaint id is required");
  }

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
      complainer: {
        select: { name: true, email: true, role: true },
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

  return complaint;
};

const getAllComplaints = async () => {
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: "desc" },
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
      complainer: { select: { name: true, email: true, role: true } },
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
  });

  return complaints;
};

const getUserComplaints = async (user) => {
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

  const complaints = await prisma.complaint.findMany({
    where: { complainerId },
    orderBy: { createdAt: "desc" },
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
      complainer: { select: { name: true, email: true, role: true } },
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
  });

  return complaints;
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
      complainer: { select: { name: true, email: true, role: true } },
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

  if (
    Array.isArray(newComplaint.responses) &&
    newComplaint.responses.length > 0
  ) {
    await Promise.all(
      newComplaint.responses.map((r) =>
        createResponse({ ...r, complaintId: id })
      )
    );
    return await prisma.complaint.findUnique({
      where: { id },
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
        complainer: {
          select: { name: true, email: true, role: true },
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
  }

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
