//############### FIRST WAY BY PROMISES

const asyncHandler =(requestHandler) =>{
    (req,res, next) =>{
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    }
}



export {asyncHandler}



// ################ 2ND WAY THAT IS TRY CATCH YOU CAN USE ANY OF THEM
// const asyncHandler = (fn) => () => 
// const asyncHandler = (fn) => {() => {}}
// const asyncHandler = (fn) => () => {}
// const asyncHandler = (fn) => async () => {}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.staus(error.code || 500).json({
//             success : false,
//             message : error.message
//         })
//     }
// }
