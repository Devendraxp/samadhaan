import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

function authenticate(req,res,next){
    const {source} = req.query;
    if(source === "web"){
        const token = req.cookies.accessToken;
        if(!token) return res.status(401).json({ message: "Unauthorized" });

        try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
        }catch (err){
            throw new ApiError(401,err.message || "Unauthorized");
        }
    }
    const token = req.headers.authentication;

    if(!token) return res.status(401).json({ message: "Unauthorized" });

    const [type, jwtToken] = token.split(" ");
    if(type !== "Bearer" || !jwtToken) throw new ApiError(401, "Unauthorized");


    try{
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    }catch (err){
        throw new ApiError(401,err.message || "Unauthorized");
    }
}


export { authenticate };