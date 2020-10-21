const express = require('express');
const router = express.Router();
const { Book } = require('../models');

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET home page. */
router.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books');
})); 

/* GET home page. */
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('index', { books, title: "Books" });
})); 

/* GET new book form. */
router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book', { book: {}, title: "New Book"});
})); 

/* POST new book form. */
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books");
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await book.build(req.body);
      res.render("books/new", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
})); 

/* GET book details. */
router.get("/books/:id", asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  res.render("update-book", { book, title: "Update Book" });
}));

/* POST book details. */
router.post("/books/:id", asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books")
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name ==  "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("/book/" + book.id, { book, errors: error.errors, title: "Edit Book" });
    }
  }
}));

/* POST book details. */
router.post("/books/:id/delete", asyncHandler(async(req, res) => {
  book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books")
  } else {
    res.sendStatus(404);
  }
}));

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