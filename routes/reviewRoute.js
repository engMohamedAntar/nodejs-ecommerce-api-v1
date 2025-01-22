const express= require('express');
const {protect, allowedTo}= require('../services/authService');
const {getReviews, getReview, createReview, updateReview, deleteReview, createFilterObject, setProductIdAndUserIdToBody}= require('../services/reviewService');
const {createReviewValidator, getReviewValidator, updateReviewValidator, deleteReviewValidator} = require('../utils/validators/reviewValidator');
const router= express.Router({mergeParams: true});


router.route('/')
    .get(createFilterObject,getReviews)
    .post(
        protect,
        allowedTo('user'),
        setProductIdAndUserIdToBody,
        createReviewValidator,
        createReview
    )
router.route('/:id')
    .get(getReviewValidator,getReview)
    .put(
        protect,
        allowedTo('user'),
        updateReviewValidator,
        updateReview
    )
    .delete(
        protect,
        allowedTo('user','admin','manager'),
        deleteReviewValidator,
        deleteReview
    );

module.exports= router;