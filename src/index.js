// require ('dotenv').config({path : './env'})   
// this will also work in just one line but it messes the code consistency as we used import everywhere but here we are using require , to solve this we will use import and run script as experiment (see package.json)

import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path : './env'
})

connectDB();




















/*
// first approach to connect to db, sometimes in industry standard we start the IIFE with ; which solve some errors when the previous lines doesn't have ;,

// ;(()=>{
    // code
    })()

import express from "express"
const app = express();
( async () =>{
    try {
        await mongoose.connect(`${process.env.MONDODB_URL}/${DB_NAME}`)
        app.on("error",(error) =>{
            console.console.log("ERR : ", error);
            throw error;
        })
        app.listen(process.env.PORT, () =>{
            console.log("App is listening on port ", process.env.PORT)
        })
        
    } catch (error) {
        console.error("ERROR : ", error)
        throw error
    }
})()
*/