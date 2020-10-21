const express = require('express');
const router = express.Router();
const { Book } = require('../models');

/* GET home page. */
router.get('/', async (req, res) => {
  const books = await Book.findAll();
  res.render('all_books', { books })
}); 

//If no routes match then this runs and creates a 404 error
router.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  err.message = "File Not Found";
  next(err);
});

//Routing error handler to handle any errors that come through
router.use((err, req, res, next) => {
  if (err.status === 404){
    console.log(err);
    res.render('page-not-found', { err });
  } else {
    /**TODO: CREATE ERROR PAGES */
    if(!err.status) {
      err.status = 500;
    }
    if(!err.message) {
      err.message = "An error has occured";
    }
    console.log(err);
    res.render('error', { err });
  }
});

module.exports = router;