//productValidator.js
const slugify= require('slugify');
const {check,body}= require('express-validator');
const validatorMiddleware= require('../../middlewares/validatorMiddleware');
const CategoryModel= require("../../models/categoryModel");
const SubCategoryModel= require('../../models/subCategoryModel');
const subCategoryModel = require('../../models/subCategoryModel');
// the validation layer of the getProduct route
exports.getProductValidator= [
    check('id').isMongoId().withMessage("Invalid Product id format"),
    validatorMiddleware
];

// the validation layer of createProduct route
exports.createProductValidator= [
    check('title')
        .notEmpty().withMessage('Product required')
        .isLength({min:3}).withMessage('Too short Product name')
        .custom((val,{req})=>{
            req.body.slug=slugify(val);
            return true;
        }),
    check('description')
        .notEmpty().withMessage('description is required')
        .isLength({max:2000}).withMessage('Too long product description'),
    check('quantity')
        .notEmpty().withMessage('Product quantity is required')
        .isNumeric().withMessage('Product quantity must be number'),
    check('sold')
        .optional()
        .isNumeric().withMessage('Product quantity must be number'),
    check('price')
        .notEmpty().withMessage('Product price is required')
        .isNumeric().withMessage("Price should be a number")
        .isLength({max:32})
        .toFloat(),
    check('priceAfterDiscount')
        .optional()
        .isNumeric().withMessage("Price should be a number")
        .toFloat()
        .custom((value, {req})=>{               //.custom helps you to provide your own validation rules beyond the built-in validators
            if(req.body.price <= value) {
                throw new Error('PriceAfterDiscount must be lower than price');
            }
            return true;
        }),
    check("colors")
        .optional()
        .isArray().withMessage('availableColors should be array of string'),
    check('imageCover')
        .notEmpty().withMessage("Product image cover is required"),
    check('images')
        .optional()
        .isArray().withMessage('Images should be array of string'),
    check('category')
        .notEmpty().withMessage('Product must belong to a category')
        .isMongoId().withMessage('Invalid ID format')
        .custom((categoryId)=> {
            return CategoryModel.findById(categoryId).then((category)=>{
                if(!category)
                    return Promise.reject(new Error(`No category for this id: ${categoryId}`));
            }) 
        }  
        ),
    check('subcategories')
        .optional()
        .isMongoId().withMessage('Invalid ID format')
        .isArray().withMessage('subcategries must be array of IDS')
        .custom((subCategoryIds)=>                                                                      // ensure that subcategories exist in the database
            SubCategoryModel.find({ _id:{ $exists: true, $in: subCategoryIds }}).then((results)=>{      // find subcategories that exist both in the database and subCategoryIds
                if(results.length<1 || subCategoryIds.length !== results.length) 
                    return Promise.reject(new Error(`These subcategory ids don't exist`));
            })
        )
        .custom((subCategoryIds, {req})=>                          // ensure that subcategories belong to the provided category
            SubCategoryModel.find({category: req.body.category}).then((subCategories)=>{

                const subCategoriesIdsInDB= [];
                subCategories.forEach(subcategory=>subCategoriesIdsInDB.push(subcategory._id.toString())); //subCateoriesIdsInDB includes all subcategories ids that belong to the category provided into the rquest body
                      
                //now check weather subCategoryIds(we send in the req body) exist in the subCateoriesIdsInDB
                if(!subCategoryIds.every(val=>subCategoriesIdsInDB.includes(val)))
                    return Promise.reject(new Error('subcategories not belong to the category you provided'));
                }
            )
        ),

    check('brand')
        .optional()
        .isMongoId().withMessage('Invalid ID format'),
    check('ratingsAverage')
        .optional()
        .isNumeric()
        .isFloat({min:1, max: 5}).withMessage('Rating must be between 1 and 5'),
    check('ratingsQuantity')
        .optional()
        .isNumeric().withMessage('ratingsQuantity must be a number'),
    validatorMiddleware
];

// the validation layer of updateProduct route
exports.updateProductValidator= [
    check('id').isMongoId().withMessage("Invalid Product id format"),
    check('imageCover')
    .optional(),
    body('title')
    .optional()                         //title may not be updated 
    .custom((val,{req})=>{
        req.body.slug= slugify(val);
        return true;
    }),
    validatorMiddleware
];

// the validation layer of deleteProduct route
exports.deleteProductValidator= [
    check('id').isMongoId().withMessage("Invalid Product id format"),
    validatorMiddleware
];









//notices
//  the difference between "param" and "check" is that param can check only the parameters in the url
//  while "chck" can check all kinds of data (params, body, arguments) in the request
// .find({_id:{ $exists: true, $in: subCategoryIds }}) --> return all the subcategories 
// that have _id and also this _id exist in the subCategoryIds array
