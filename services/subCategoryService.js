//subCategoryService.js
const asyncHandler= require('express-async-handler');
const slugify= require('slugify');
const SubCategoryModel= require('../models/subCategoryModel');
const ApiError = require('../utils/ApiError');
const { findByIdAndUpdate } = require('../models/categoryModel');
const CategoryModel = require('../models/categoryModel');
const ApiFeatures= require('../utils/apiFeatures');
const factory= require('./handlersFactory');


//@desc     add categoryId to the body of the request in createSubCategory
exports.setCategoryIdToBody= (req,res,next)=>{    
    if(!req.body.category)                                          // if the category isn't sent in the req.body (in case of creating a subcategory on a category)
        req.body.category= req.params.categoryId;
    next();
};

//@desc     add filterObj to the req in case of getSubCategories
// Get /api/v1/categories/:categoryId/subcategories
exports.createFilterObj= (req,res,next)=>{
    let filterObj= {};
    if(req.params.categoryId)
        filterObj= {category: req.params.categoryId};
    req.filterObj=filterObj;
    next();
};

// @desc    Create subCategories
// @route   POST  /api/v1/subcategories
// @access  Private
exports.createSubCategory= factory.createOne(SubCategoryModel);

// @desc    Get list of subcategories
// @route   GET /api/v1/subcategories
// @access  Public
exports.getSubCategories= factory.getAll(SubCategoryModel);


// @desc    Get specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
exports.getSubCategory= factory.getOne(SubCategoryModel);

// @desc    Update specific subcategory
// @route   PUT /api/v1/subcategories/:id
// @access  Private
exports.updateSubCategory= factory.updateOne(SubCategoryModel);

// @desc    Delete specific subCategory
// @route   DELETE /api/v1/subcategories/:id
// @access  Private
exports.deleteSubCategory= factory.deleteOne(SubCategoryModel);


//notices
// .populate('category');==> will show all the info of the category
// .pupulate({path:'category' select:'name -_id'}) -->will select the name only and discard the id and other data