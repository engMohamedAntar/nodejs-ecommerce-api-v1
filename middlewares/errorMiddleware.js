const ApiError = require("../utils/ApiError");

//errorMiddleware.js
const handleJwtInvalidSignature= ()=> 
    new ApiError('invalid token, please logIn again',401);
//errorMiddleware.js
const handleTokenExpired= ()=> 
    new ApiError('token expired, please logIn again',401);

const golbalError= (err,req,res,next)=>{
    err.statusCode= err.statusCode || 500;
    err.status= err.status || "error";
    if(process.env.NODE_ENV==='development')
        sendErrorForDev(res,err);
    else //in production mode
    {
        if(err.name==='JsonWebTokenError') 
           err= handleJwtInvalidSignature();//?
        if(err.name==='TokenExpiredError') 
           err= handleTokenExpired();
        sendErrorForProd(res,err);
    }
}

const sendErrorForDev= (res,err)=>{
        return res.status(err.statusCode).json({
        error: err,
        message: err.message,           
        stack: err.stack    
    })
};

const sendErrorForProd= (res,err)=>{
        return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,           
    })
};


module.exports= golbalError;




// notices
//built-in properties of the Error object (such as message and stack) aren't included automatically when the object is converted to JSON, so that we need to explicitly add them

//handleJwtInvalidSignature=> instead of using the default err values (statusCode=500, status= error) create
// a new err and set it to err









