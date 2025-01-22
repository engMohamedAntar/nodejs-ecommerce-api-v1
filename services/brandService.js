//brandService.js
const sharp= require('sharp');
const { v4: uuidv4 } = require('uuid');         //creates a random id

const asyncHandler= require('express-async-handler');
const BrandModel= require('../models/brandModel');
const factory= require('./handlersFactory');
const {uploadSingleImage}= require('../middlewares/uploadimageMiddleware');


//upload single image
exports.uploadBrandImage= uploadSingleImage('image');  

//Image processing
exports.resizeImage= asyncHandler( async(req,res,next)=>{
    const fileName= `brand-${uuidv4()}-${Date.now()}.jpeg`;
    if(req.file&& req.file.buffer)
    {
        await sharp(req.file.buffer)
        .resize(400,400)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`uploads/brands/${fileName}`);
        req.body.image= fileName; // save image to data base (req.body is passed to the Model.create in the createOne function)
    }
    
    next();
});

// @desc Get list of brands
// @route Get /api/v1/brands
// @access Public
exports.getBrands= factory.getAll(BrandModel);

// @desc Get specific brand
// @route Get /api/v1/brands/:id
// @access Public
exports.getBrand= factory.getOne(BrandModel);

// @desc Create specific brand
// @route Post /api/v1/brands
// @access Private
exports.createBrand= factory.createOne(BrandModel);

// @desc Update specific brand
// @route Put /api/v1/brands/:id
// @access Private
exports.updateBrand= factory.updateOne(BrandModel);

// @desc Delete specific brand
// @route Delete /api/v1/brands/:id
// @access Private
exports.deleteBrand= factory.deleteOne(BrandModel);