//productService.js
const multer = require('multer');
const sharp = require('sharp');
const slugify= require('slugify');
const { v4: uuidv4 } = require('uuid');
const asyncHandler= require('express-async-handler');
const ProductModel= require('../models/productModel');
const ApiError= require('../utils/ApiError');
const ApiFeatures= require('../utils/apiFeatures');
const factory= require('./handlersFactory');
const {uploadMixOfImages}= require('../middlewares/uploadimageMiddleware');

exports.uploadProductImages= uploadMixOfImages([
    {
        name:'imageCover',
        maxCount:1
    },
    {
        name:'images',
        maxCount:5
    }
]);

exports.resizeProductImages=asyncHandler( async(req,res,next)=>{
    
    //image processing for imageCover
    if(req.files.imageCover) //req.files && 
    {
        const imageCoverName=`product-${uuidv4()}-${Date.now()}-cover.jpeg`;

        await sharp(req.files.imageCover[0].buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality: 95})
        .toFile(`uploads/products/${imageCoverName}`);

        req.body.imageCover= imageCoverName; // save the imageCover name to the database
    }

    //image processing for images
    if(req.files.images) //req.files&&
    {
        req.body.images= [];
            await Promise.all( //?
                req.files.images.map(async (img,index) => {
                    const imgName= `product-${uuidv4()}-${Date.now()}-image${index+1}.jpeg`;

                    await sharp(img.buffer)
                    .resize(2000,1333)
                    .toFormat('jpeg')
                    .jpeg({quality: 95})
                    .toFile(`uploads/products/${imgName}`);
                
                    //save images to database
                    req.body.images.push(imgName);
                })
        );
    }
    next();
});

// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts= factory.getAll(ProductModel,'ProductModel');

// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct= factory.getOne(ProductModel,'reviews');

// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private/admin-manager
exports.createProduct= factory.createOne(ProductModel);

// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private/admin-manager

exports.updateProduct= factory.updateOne(ProductModel);

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private/admin
exports.deleteProduct= factory.deleteOne(ProductModel);














//  # notices
//  asyncHandler handles the incorrect Id formate, whlie conditions inside the funcions handles the
//  incorrect Ids.

/*
- await Promise.all() --> tells the program to wait until **all async functions (sharp()) finish**, and then move to the rest of the code (the next() function in your case).
- Promise.all() --> is a method that takes an array of promises (coming from each sharp() execution for each image) and returns a single promise that resolves when all of the promises in the array have either resolved or rejected.
- await of Promise.all() --> ensures that the code execution waits for Promise.all() to finish. Once all the images are processed, it continues to the next middleware or task (in this case, it will execute next()).
- await of sharp() (without Promise.all()) --> when you use await inside an async function without wrapping it in Promise.all(), each async function (sharp() call) pauses and waits for its specific asynchronous operation to complete before moving on to the next iteration.
- Without Promise.all(), you are not telling your program to wait for **all the async tasks (image processing)** to finish before moving on.
- So using await without Promise.all() will force sharp operations to work sequentially (one by one), while using await with Promise.all() makes sharp() operations work in parallel (simultaneously).
*/
