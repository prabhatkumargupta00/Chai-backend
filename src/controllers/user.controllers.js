import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";



// Creating a method to generate access and refresh token whenever required.
const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = generateAccessToken()
        const refreshToken = generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})

        return{accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token.")
    }
}

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
    const existedUser = await User.findOne({
        $or :[{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "The user with this email or username already exists.")
    }


    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // The upper code doesn't work properly if we don't send the cover image so we can check it by using if else

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;

    }

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


const loginUser = asyncHandler(async (req, res) =>{
    // Login user
    // req body se data le aao
    // username or email
    // find the user
    // if user exist then check for passeword
    // if pass right generate access token and refresh token
    // send these tokens in cookies(secure)
    // send a response
    
    const {email, username, password} = req.body;
    
    if(!username && !email){
        throw new ApiError(400," Username or password is required")
    }

    const user = await User.findOne({
        $or : ({email, username})
    })

    if(!user){
        throw new ApiError(404, "User does not exist.")
    }

    // don't use User with capital u becasue that is used to use with mongodb functionality whereas here we must use "user" with small lettercase that we have created.

    const isPasswordValid =  await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential.")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

    // Cookies are beDefault modifiable by anyone but we want to make it secure so we add these options where " httpOnly: true," means it is only changed by the served and "secure : true" keeps it secure.
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully ! "
        )
    )


})


const logOutUser = asyncHandler (async(req, res) =>{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out !"))
})




export {
    registerUser,
    loginUser,
    logOutUser
}
