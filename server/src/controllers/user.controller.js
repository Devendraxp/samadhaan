import {findUserById} from "../services/user.service.js";

const getProfile = async( req, res, next) =>{
  const userId = req.user.id;
  const userData = await findUserById(userId);
  res.json(userData);
}


export{getProfile};