import prisma from "../utils/Prisma.js";
import { createResponse } from "./response.service.js";

const createComplaint = async (complaint) => {
    const {
        subject,
        description,
        mediaLink,
        domain,
        complainerId,
        anonymous = false,
    } = complaint;

    if (!subject || !description || !domain || !complainerId) {
        throw new Error("Plz provide whole info for complaint...");
    }
    const createdComplaint = await prisma.complaint.create({
        data: {
            subject,
            description,
            mediaLink,
            domain,
            complainer: { connect: { id: complainerId } },
            anonymous,
        },
    });

    return createdComplaint;

}

const getComplaintDetailsById = async(complaintId)=>{
    const complaint = await prisma.complaint.findUnique({
        where : {id: complaintId },
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
                select: {
                    id: true,
                    name: true,
                },
            },
            responses: {
                select: {
                    id: true,
                    content: true,
                    mediaLink: true,
                    createdAt: true,
                    responder : true,
                    responderId : true,
                },
            },
        },

    })

    if(!complaint){
        throw new Error("Complaint not found");
    }

    // hide complainer info for anonymous complaints
    if (complaint.anonymous) {
        complaint.complainer = { id: complaint.complainer?.id ?? null, name: "Anonymous" };
    }

    return complaint;
}

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
            complainer: {
                select: {
                    id: true,
                    name: true,
                },
            },
            responses: {
                select: {
                    id: true,
                    content: true,
                    mediaLink: true,
                    responder : true,
                    responderId: true,
                },
            },
        }
    })

      // hide complainer for anonymous complaints
    return complaints.map(c => {
        if (c.anonymous) {
            return { ...c, complainer: { id: c.complainer?.id ?? null, name: "Anonymous" } };
        }
        return c;
    });

}

const getUserComplaints = async (user) => {
  if (!user) {
    throw new Error("User not found");
  }

  const complainerId =
    user.complainerId ||
    user.id ||
    user.sub ||
    (typeof user === "string" ? user : null);

  if (!complainerId) {
    throw new Error("Authenticated user has no id/complainerId");
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
      complainer: {
        select: {
          id: true,
          name: true,
        },
      },
      responses: {
        select: {
          id: true,
          content: true,
          mediaLink: true,
          responder: true,
          responderId: true,
        },
      },
    },
  });

  return complaints;
};

const updateComplaint = async(newComplaint)=>{
    const {id}  = newComplaint;
    if(!id){
        throw new Error("Provide ComplaintId for updation.");
    }

    const existing  = await prisma.complaint.findUnique({where : {id}});
    if (!existing) throw new Error("Complaint not found"); 

    const data = {
        subject: newComplaint.subject ?? existing.subject,
        description: newComplaint.description ?? existing.description,
        mediaLink: newComplaint.mediaLink ?? existing.mediaLink,
        domain: newComplaint.domain ?? existing.domain,
        anonymous: newComplaint.anonymous ?? existing.anonymous,
        status: newComplaint.status ?? existing.status,
    }

    if(newComplaint.complainerId){
        data.complainer = {connect : {id: newComplaint.complainerId}};
    }

    const updated = await prisma.complaint.update({
         where: { id },
        data,
        include: { responses: true, complainer: true },
    })

     if (Array.isArray(newComplaint.responses) && newComplaint.responses.length > 0) {
        await Promise.all(newComplaint.responses.map(r =>
            createResponse({ ...r, complaintId: id })
        ));
        return await prisma.complaint.findUnique({
            where: { id },
            include: { responses: true, complainer: true },
        });
    }

    return updated;


}

const deleteComplaint = async (complaintId) => {
  if (!complaintId) {
    throw new Error("Provide complaintId for deletion.");
  }

  const result = await prisma.complaint.deleteMany({
    where: { id: complaintId },
  });

  if (result.count === 0) {
    throw new Error("Complaint not found or already deleted");
  }

  return result;
};


export { createComplaint, getAllComplaints ,getUserComplaints , getComplaintDetailsById, updateComplaint , deleteComplaint};