import { createResponse,getAllResponses, getComplaintResponses } from "../services/response.service.js"

const createResponseController = async(req,res,next)=>{
    try {
        const response = {
            ...req.body,
            responderId : req.user?.sub
        };
        if(!response.responderId){
            return res.status(400).json({message : "responderId is required"});
        }
        const created = await createResponse(response);
        return res.status(201).json({message : "Response created successfully" , data : created});

    } catch (error) {
        return next(error);
    }
}

const getAllResponsesController = async(req,res,next)=>{
    try {
        const responses = await getAllResponses();
        return res.status(201).json({message : "Successfully got all the responses from db." , data : responses});
    } catch (error) {
        return next(err)
    }
}

const getComplaintResponses = async(req,res,next)=>{
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({message : "complaintId is required"});
        }


    } catch (error) {
        next(error);
    }
}

export {createResponseController,getAllResponsesController}