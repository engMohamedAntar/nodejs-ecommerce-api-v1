const slugify = require('slugify');
const {check,body}= require('express-validator');
const validatorMiddleware= require('../../middlewares/validatorMiddleware');

// the validation layer of createBrand route
exports.createBrandValidator= [
    check('name')
    .notEmpty().withMessage('Brand required')
    .isLength({min:3}).withMessage('Too short brand name')
    .isLength({max:32}).withMessage('Too long brand name')
    .custom((val,{req})=>{
            req.body.slug= slugify(val);
        return true;
    }),
    validatorMiddleware
]

// the validation layer of the getBrand route
exports.getBrandValidator= [
    check('id').isMongoId().withMessage("Invalid brand id format"),
    validatorMiddleware
]
// the validation layer of updateBrand route
exports.updateBrandValidator= [
    check('id').isMongoId().withMessage("Invalid brand id format"),
    body('name')
    .optional()                         //name may not be updated
    .custom((val,{req})=>{
        req.body.slug= slugify(val);
        return true;
    })
    ,
    validatorMiddleware
]
// the validation layer of deleteBrand route
exports.deleteBrandValidator= [
    check('id').isMongoId().withMessage("Invalid brand id format"),
    validatorMiddleware
]









//notices
//  the difference between "param" and "check" is that param can check only the parameters in the url
//  while "chck" can check all kinds of data (params, body, arguments) in the request
