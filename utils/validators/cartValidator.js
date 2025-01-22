const {check}= require('express-validator');

const validatorMiddleware= require('../../middlewares/validatorMiddleware');
exports.addProductToCartValidator= [
    check('productId').isMongoId().withMessage('not a vaid mongoId'),
    validatorMiddleware
]