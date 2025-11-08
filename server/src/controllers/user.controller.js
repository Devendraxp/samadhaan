import {findUserById} from "../services/user.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getProfile = async( req, res, next) =>{
  console.log(req.user);
  const userId = req.user.sub;
  const userData = await findUserById(userId);
  return res.status(200).json(new ApiResponse(200, userData, "User profile fetched successfully."));
}


export{getProfile};