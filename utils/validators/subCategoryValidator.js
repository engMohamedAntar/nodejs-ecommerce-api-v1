const slugify= require('slugify');
const {check,body}= require('express-validator');
const validatorMiddleware= require('../../middlewares/validatorMiddleware');

exports.createSubCategoryValidator=[
    check('name')
    .notEmpty().withMessage('Category required')
    .isLength({min:2}).withMessage('Too short category name')
    .isLength({max:32}).withMessage('Too long cagetory name')
    .custom((val,{req})=>{
        req.body.slug= slugify(val);
        return true;
    }),
    check('category')
    .notEmpty().withMessage('subCategory must belong to a category')
    .isMongoId().withMessage("Invalid subCatetgory id format"),
    
    validatorMiddleware        
]

exports.getSubCategoryValidator= [
    check('id')
        .notEmpty().withMessage("id is required")
        .isMongoId().withMessage("this is invalid subcategory id format"),
        validatorMiddleware
]
exports.updateSubCategoryValidator= [
    check('id')
        .notEmpty().withMessage("id is required")
        .isMongoId().withMessage("this is invalid subcategory id format"),
    body('name')
        .optional()                         //title may not be updated         
        .custom((val,{req})=>{
            req.body.slug= slugify(val);
            return true;
        }),
        validatorMiddleware
]
exports.deleteSubCategoryValidator= [
    check('id')
        .notEmpty().withMessage("id is required")
        .isMongoId().withMessage("this is invalid subcategory id format"),
        validatorMiddleware
]






