import prisma from "../utils/Prisma.js";

const createResponse = async(response)=>{
        const  {
            complaint,
            complaintId,
            content,
            mediaLink,
            responder,
            responderId,
            isVisible,
        } = response;


        if (!complaintId && !(complaint && complaint.id)) {
            throw new Error("Provide complaintId or complaint.id");
        }
        if (!responderId && !(responder && responder.id)) {
            throw new Error("Provide responderId or responder.id");
        }
        if (!content) {
            throw new Error("Response content is required");
        }

        const createdResponse = await prisma.response.create({
            data : {
                complaint : {connect : {id : complaintId ?? complaint.id}},
                content,
                mediaLink,
                responder :{connect : {id: responderId?? responder.id}},
                isVisible: isVisible ?? true
              }
        })

        return createdResponse;
}

const getAllResponses = async()=>{
    const responses = await prisma.response.findMany({
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            content: true,
            mediaLink: true,
            isVisible: true,
            createdAt: true,
            updatedAt: true,
            responderId: true,
            responder: { select: { id: true, name: true } },
            complaintId: true,
        },
    });

    return responses;
}

const getComplaintResponses = async(complaint)=>{
    if (!complaint) {
        throw new Error("Unable to get the complaint object for the Responses.");
    }
    if(!complaint.complaintId){
        throw new Error("Unable to get the complaintId for the Responses.");
    }

    const responses = await prisma.response.findMany({
        where: { complaintId : complaint.complaintId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            content: true,
            mediaLink: true,
            isVisible: true,
            createdAt: true,
            updatedAt: true,
            responderId: true,
            responder: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return responses;
}

export {createResponse,getAllResponses,getComplaintResponses};