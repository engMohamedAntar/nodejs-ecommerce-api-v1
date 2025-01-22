//ProductRoutes.js
const express= require('express');
const {getProductValidator, createProductValidator, updateProductValidator, deleteProductValidator}= require('../utils/validators/productValidator');
const {protect, allowedTo}= require('../services/authService');
const reviewRoute= require('./reviewRoute');
const {
      getProducts,
      createProduct,
      getProduct,
      updateProduct,
      deleteProduct,
      uploadProductImages,
      resizeProductImages
    } = require('../services/productService');

const router= express.Router(); 

// create nested route for riviews on pruducts
router.use('/:productId/reviews',reviewRoute);
// http://localhost:8000/api/v1/products/66e1351096a827871476a6f6/reviews


router.route('/')               
    .get(getProducts)
    .post(
        protect,
        allowedTo('admin', 'manager'),
        uploadProductImages,
        resizeProductImages,
        createProductValidator, 
        createProduct)
router.route('/:id')
    .get(getProductValidator, getProduct)
    .put(
        protect,
        allowedTo('admin', 'manager'),
        uploadProductImages,
        resizeProductImages,
        updateProductValidator, 
        updateProduct)
    .delete(
        protect,
        allowedTo('admin'),
        deleteProductValidator,
        deleteProduct)
module.exports= router;