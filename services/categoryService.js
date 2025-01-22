//categoryService.js
const sharp= require('sharp');
const multer= require('multer');
const { v4: uuidv4 } = require('uuid');         //?
const asyncHandler= require('express-async-handler');
const CategoryModel= require('../models/categoryModel');
const factory= require('./handlersFactory');
const {uploadSingleImage}= require('../middlewares/uploadimageMiddleware');

//upload single image
exports.uploadCategoryImage= uploadSingleImage('image');  //?

//Image processing
exports.resizeImage= asyncHandler( async(req,res,next)=>{  //?
    console.log(req.file);
    
    const fileName= `category-${uuidv4()}-${Date.now()}.jpeg`;
    if(req.file)
    {
        await sharp(req.file.buffer)
        .resize(400,400)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`uploads/categories/${fileName}`);

        req.body.image= fileName; //? 
    }
    next();
});

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories= factory.getAll(CategoryModel);

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory= factory.getOne(CategoryModel);

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private/Admin-Manager
exports.createCategory= factory.createOne(CategoryModel);

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin-Manager
exports.updateCategory= factory.updateOne(CategoryModel);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deletCategory= factory.deleteOne(CategoryModel);


//notices
//resizeImage -> this middleware used in categoryRoute after uploadCategoryImage
//uploadCategoryImage -> we use the uploadCategoryImage in the categoryRouter
//req.body.image= fileName; -> save image to data base (req.body is passed to the Model.create in the createOne function)
//uuidv4 -> creates a random id