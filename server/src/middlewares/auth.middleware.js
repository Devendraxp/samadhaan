import jwt from "jsonwebtoken";


function isLoggedIn(req,res,next){

    req.user = {
        id:1,
        email: "user@example.com"
    };
    next();
}