const express = require('express');
const path = require('path');
const { sequelize } = require('./models');

//brings in all the routes for the app
const routes = require('./routes');

const app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//sets up static server
app.use('/static', express.static(path.join(__dirname, 'public')))

//brings in routes
app.use(routes);

// catch 404 
app.use( (req, res, next) => {
  const error = new Error();
  error.status = 404;
  error.message = `Page not found.`
  res.render('page-not-found', {error});
});

// error handler
app.use( (err, req, res, next) => {
  if(err.status === 404) {
    res.status(404).render('page-not-found', {err});
  } else {
    err.message = err.message || `Oops! It looks like something went wrong on the server.`;
    res.status(err.status || 500).render('error', {err});
  }
});

//This syncs the database before opening the port to listen on
sequelize.sync().then(() => {
  app.listen(3000);
});