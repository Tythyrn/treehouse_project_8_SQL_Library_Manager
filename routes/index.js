const express = require('express');
const router = express.Router();
const { Book, Sequelize } = require('../models');
const { Op } = require("sequelize");

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

//Function to show 9 books on the page.  Modified from one of my previous projects
function showPage (books, page) {
  const startIndex = (page * 9) - 9;
  const endIndex = page * 9;
  bookList = [];

  for (let i = 0; i < books.length; i++) {
     if(i >= startIndex && i < endIndex) {
        bookList.push(books[i]);
     }
  }
  return bookList;
}

/* GET home page. Redirects to /books*/
router.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books');
})); 

/* GET home page. */
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  const bookList = showPage(books, 1);
  const pages = Math.ceil(books.length / 9);
  res.render('index', { books: bookList, pages, title: "Books" });
})); 

/* GET page selected based on the page or tab the user chose*/
router.get('/books/page/:id', asyncHandler(async (req, res) => {
  //finds all the books then shows up to 9 based on the current page selected
  const books = await Book.findAll();
  const bookList = showPage(books, req.params.id);
  const pages = Math.ceil(books.length / 9);
  res.render('index', { books: bookList, pages, title: "Books" });
})); 

/* GET search results from the user's input*/
router.post('/books/search', asyncHandler(async (req, res) => {
  /**
   * SELECT *
   * FROM Books
   * WHERE title LIKE '%<search>%
   * OR author LIKE '%<search>%
   * OR genre LIKE '%<search>%
   * OR year LIKE '%<search>%;
   */
  const books = await Book.findAll({
    where: Sequelize.or(
      {
        title: {
          [Op.substring]: req.body.search
        }
      },
      {
        author: {
          [Op.substring]: req.body.search
        }
      },
      {
        genre: {
          [Op.substring]: req.body.search
        }
      },
      {
        year: {
          [Op.eq]: req.body.search
        }
      }
    )
  })
  const bookList = showPage(books, 1);
  const pages = Math.ceil(books.length / 9);
  res.render('index', { books: bookList, pages, title: "Books" });
})); 

/* GET new book form. */
router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book', { book: {}, title: "New Book"});
})); 

/* POST new book form. */
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  //trys to create the book based on the inputted data.  If title or author are missing it grabs the error and displays that information
  try {
    book = await Book.create(req.body);
    res.redirect("/books");
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("new-book", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
})); 

/* GET book details. */
router.get("/books/:id", asyncHandler(async(req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("update-book", { book, title: "Update Book" });
  } else {
    const err = new Error();
    err.status = 404;
    err.message = `Page not Found`;
    next(err);  
  }
}));

/* POST Update book details. */
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
      res.render("update-book", { book, errors: error.errors, title: "Update Book" });
    }
  }
}));

/* POST Delete book. */
router.post("/books/:id/delete", asyncHandler(async(req, res) => {
  book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books")
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;