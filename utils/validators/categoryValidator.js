const slugify= require('slugify');
const {check,body}= require('express-validator');
const validatorMiddleware= require('../../middlewares/validatorMiddleware');

exports.getCategoryValidator= [
    check('id').isMongoId().withMessage("Invalid category id format"),
    validatorMiddleware
]

exports.createCategoryValidator= [
    check('name')
    .notEmpty().withMessage('Category required')
    .isLength({min:3}).withMessage('Too short category name')
    .isLength({max:32}).withMessage('Too long cagetory name')
    .custom((val,{req})=>{
        req.body.slug= slugify(val);
        return true;
    }),
    validatorMiddleware
]

exports.updateCategoryValidator= [
    check('id').isMongoId().withMessage("Invalid category id format"),
    body('name')
    .optional()                         //name may not be updated
    .custom((val,{req})=>{
        req.body.slug= slugify(val);
        return true;
    }),
    validatorMiddleware
]
exports.deleteCategoryValidator= [
    check('id').isMongoId().withMessage("Invalid category id format"),
    validatorMiddleware
]









//notices
//  the difference between "param" and "check" is that param can check only the parameters in the url
//  while "chck" can check all kinds of data (params, body, arguments) in the request
