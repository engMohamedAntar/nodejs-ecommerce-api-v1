const express= require('express');
const {createSubCategory, getSubCategories, getSubCategory, updateSubCategory, deleteSubCategory,setCategoryIdToBody, createFilterObj}= require('../services/subCategoryService');
const {createSubCategoryValidator, getSubCategoryValidator, updateSubCategoryValidator, deleteSubCategoryValidator}= require('../utils/validators/subCategoryValidator');
const {protect, allowedTo}= require('../services/authService');
// mergeParams: Allow us to access parmeters on other routers
// ex: We need to access categoryId from category router (when accessing subcategories from a spcific category)
const router= express.Router({mergeParams: true});

router.route('/')
    .post(
        protect,
        allowedTo('admin','manager'),
        setCategoryIdToBody,
        createSubCategoryValidator,
        createSubCategory)
    .get( createFilterObj ,getSubCategories)
router.route('/:id')
    .get(getSubCategoryValidator, getSubCategory)
    .put(
        protect,
        allowedTo('admin','manager'),
        updateSubCategoryValidator, 
        updateSubCategory)
    .delete(
        protect,
        allowedTo('admin'),
        deleteSubCategoryValidator, 
        deleteSubCategory)
    

module.exports= router;









//notices
// setCategoryIdToBody => this middleware is used to add eth categoryId to the body of the
// request (when creating a subcategory on a category) so that createSubCategoryValidator
// doesn't generate an error

// createFilterObj => this middleware create a filter object to only get subcategories of a specific category
// and adds the filterObj to req so that we can access req.filerObj in the getSubCategories function