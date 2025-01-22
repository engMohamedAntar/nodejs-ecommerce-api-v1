//brandRoutes.js
const express= require('express');
const {getBrandValidator, createBrandValidator, updateBrandValidator, deleteBrandValidator}= require('../utils/validators/brandValidator');
const {protect, allowedTo}= require('../services/authService');

const {
      getBrands,
      createBrand,
      getBrand,
      updateBrand,
      deleteBrand,
      uploadBrandImage,
      resizeImage
    } = require('../services/brandService');

const router= express.Router(); 


router.route('/')               
    .get(getBrands)
    .post(
        protect,
        allowedTo('admin','manager'),
        uploadBrandImage,
        resizeImage,
        createBrandValidator, 
        createBrand)

router.route('/:id')
    .get(getBrandValidator, getBrand)
    .put(
        protect,
        allowedTo('admin','manager'),
        uploadBrandImage,
        resizeImage,
        updateBrandValidator, 
        updateBrand)
    .delete(
        protect,
        allowedTo('admin'),
        deleteBrandValidator,
         deleteBrand)
module.exports= router;