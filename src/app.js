import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended: true, limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// Importing routes
import userRouter from "./routes/user.routes.js"

// Routes declaration
app.use("/api/v1/users", userRouter)

// It will generate routes as
//http://localhost:8000/api/v1/users/:jo bhi userroutes me ho






export {app}