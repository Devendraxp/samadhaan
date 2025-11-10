import { createComplaint, deleteComplaint, getAllComplaints, getComplaintDetailsById, getUserComplaints, updateComplaint } from "../services/complaint.service.js";
import prisma from "../utils/Prisma.js";

const createComplaintController = async(req,res,next)=>{ 
    try {
        const complaint = {
            ...req.body,
            complainerId : req.user?.sub
        };
        if(!complaint.complainerId){
            return res.status(400).json({message : "complainerId is required"});
        }
        const created = await createComplaint(complaint);
        return res.status(201).json({message : "Complained created successfully" , data : created});

    } catch (error) {
        return next(error);
    }
}

const getComplaintDetailesByIdController  = async(req,res,next)=>{
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({message : "Unable to get the complaintId from params "});
        }
        const details = await getComplaintDetailsById(id);
        return res.status(201).json({message : "Successfully got the detailes of complaint" , data : details});

    } catch (error) {
        return next(error);
    }
}

const getAllComplaintsController = async(req,res,next)=>{
    try {
        const complaints = await getAllComplaints();
        return res.status(201).json({message : "Successfully get the all the complaints from db." , data : complaints});
    } catch (error) {
        return next(err)
    }
}

const getUserComplaintsController = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "User not found" });
    }

    // Fetch user object from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    //  Pass full user object to the service
    const complaints = await getUserComplaints(user);

    return res.status(200).json({ message: "User complaints fetched", data: complaints });
  } catch (error) {
    return next(error);
  }
};


const updateComplaintController = async(req,res,next)=>{
    try {
        const complaint = {
            ...req.body,
            id: req.params.id ?? req.body.id,
            complainerId: req.user?.sub,
        };
        if (!complaint.id) {
      return res.status(400).json({ message: "Complaint id is required for update" });
    }

    const updated = await updateComplaint(complaint);
    return res.status(200).json({ message: "Complaint updated", data: updated });
  } catch (error) {
    return next(error);
  }
}

const deleteComplaintController = async(req,res,next)=>{
    try {
        const {id} = req.params;

        if(!id){
            return res.status(400).json({message : "Unable to get the complaintId from params "});
        }
        const details = await deleteComplaint(id);
    return res.status(200).json({ message: "Complaint deleted", data: details });
  } catch (error) {
    return next(error);
  }
}

export {createComplaintController,getComplaintDetailesByIdController,getAllComplaintsController,getUserComplaintsController,updateComplaintController,deleteComplaintController};