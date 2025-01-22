//validatorMiddleware.js
const {validationResult }= require('express-validator');

const validatorMiddleware= (req,res,next)=>{
    const errors= validationResult(req);
    
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
        // or you can use => return next(errors);
    }
    next();
}

module.exports= validatorMiddleware;

//notices
//  middleware => catch errors from rules if exist
