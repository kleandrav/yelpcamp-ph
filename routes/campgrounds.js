// imports
const express = require('express');
const router = express.Router();
const campControls = require('../controllers/campgrounds')
const {requireLogIn, isCampAuthor, validateCamp} = require('../utils/middleware.js');
const catchAsync = require('../utils/catchAsync.js');


router.route('/')
    .get( catchAsync( campControls.index ))
    .post( requireLogIn, validateCamp, catchAsync( campControls.createCamp ));

router.get('/new', requireLogIn, campControls.newForm);

router.route('/:id')
    .get( catchAsync( campControls.showCamp ))
    .put( requireLogIn, isCampAuthor, validateCamp, catchAsync( campControls.updateCamp ))
    .delete( requireLogIn, isCampAuthor, catchAsync( campControls.deleteCamp ));

router.get('/:id/edit', requireLogIn, isCampAuthor, catchAsync( campControls.editForm ));


module.exports = router;