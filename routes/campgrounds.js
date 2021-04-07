// imports
const express = require('express');
const router = express.Router();
const campControls = require('../controllers/campgrounds')
const {requireLogIn, isCampAuthor, validateCamp} = require('../utils/middleware.js');
const catchAsync = require('../utils/catchAsync.js');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage }); // provides several methods for generating middleware that process files uploaded in multipart/form-data format

router.route('/')
    .get( catchAsync( campControls.index ))
    .post( requireLogIn, upload.array('image'), validateCamp, 
        catchAsync( campControls.createCamp ));

router.get('/new', requireLogIn, campControls.newForm);

router.get('/search', catchAsync( campControls.search ));

router.route('/:id')
    .get( catchAsync( campControls.showCamp ))
    .put( requireLogIn, isCampAuthor, upload.array('image'), 
        validateCamp, catchAsync( campControls.updateCamp ))
    .delete( requireLogIn, isCampAuthor, 
        catchAsync( campControls.deleteCamp ));

router.get('/:id/edit', requireLogIn, isCampAuthor, 
    catchAsync( campControls.editForm ));

module.exports = router;