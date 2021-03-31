// imports
const express = require('express');
const router = express.Router({mergeParams: true});
const reviewControls = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync.js');
const { validateReview, requireLogIn, isReviewAuthor } = require('../utils/middleware.js');


router.post('/', requireLogIn, validateReview, catchAsync( reviewControls.createReview ));

router.delete('/:reviewId', requireLogIn, isReviewAuthor, catchAsync( reviewControls.deleteReview ));


module.exports = router;