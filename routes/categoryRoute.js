//categoryRoutes.js
const express= require('express');
const {getCategoryValidator, createCategoryValidator, updateCategoryValidator, deleteCategoryValidator}= require('../utils/validators/categoryValidator')
const {
    getCategories,
    createCategory,
    getCategory,
    updateCategory,
    deletCategory,
    uploadCategoryImage,
    resizeImage
    } = require('../services/categoryService');
const subCategoryRoute= require('./subCategoryRoute');
const {protect, allowedTo}= require('../services/authService');
const router= express.Router(); 

//apply nested route
router.use('/:categoryId/subcategories', subCategoryRoute);
// http://localhost:8000/api/v1/categories/66e1351096a827871476a6f6/subcategories

router.route('/')               
    .get(getCategories)
    .post(
        protect,
        allowedTo('admin', 'manager'),
        uploadCategoryImage,
        resizeImage,
        createCategoryValidator, 
        createCategory)

router.route('/:id')
    .get(getCategoryValidator, getCategory)
    .put(
        protect,
        allowedTo('admin', 'manager'),
        uploadCategoryImage, 
        resizeImage, 
        updateCategoryValidator, 
        updateCategory)
    .delete(
        protect,
        allowedTo('admin'),
        deleteCategoryValidator, 
        deletCategory)
module.exports= router;