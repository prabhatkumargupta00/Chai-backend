import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js"

    // in this function we are not using res anywhere so we can just write "_" at the place of res, this is written in production grade code.
export const verifyJWT = asyncHandler(async (req, _, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer","")
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
    
            // TODO: discuss about frontend
            throw new ApiError(401, "Invalid access token !")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token !")
    }


    


})