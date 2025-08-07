import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { use } from "react";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) =>{
    // res.status(200).json({
    //     message : "Chai aur code "
    // })

    // ##################  HOW TO REGISTER A USER  ##################
    // get user details from frontend
    // validate - fields should not be empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar check
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response



    // getting user details from frontend
    const {fullName, email, password, username} = req.body;
    console.log("email :" , email, "Username: ", username)

    //To check one at a time need so much code so we can use some()
    // if(fullName === ""){
    //     throw new ApiError(400, "Fullname is required.")
    // }


    // validate - fields should not be empty
    if(
        [fullName, email, username,password].some((field) =>{
            field?.trim() === "";
        })
    ){
        throw new ApiError(400, "All fielsd are required.")
    }


    // check if user already exists: username, email
    const existedUser = User.findOne({
        $or :[{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "The user with this email or username already exist exists.")
    }


    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required.")
    }


    // upload them to cloudinary, avatar check
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required.")
    }


    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase(),
    })


    // remove password and refresh token field from response
    const CreatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    // check for user creation 
    if(!CreatedUser){
        throw new ApiError(500, "Something went wrong while registering the user.");
    }


    // return response
    return res.status(201).json(
        new ApiResponse(200, CreatedUser, "User registered successfully !")
    )

})


export {registerUser}
