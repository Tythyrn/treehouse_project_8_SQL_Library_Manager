const express = require('express');
const path = require('path');
const { sequelize } = require('./models');

//brings in all the routes for the app
const routes = require('./routes/index');

const app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//sets up static server
app.use('/static', express.static(path.join(__dirname, 'public')))

//brings in routes
app.use('/', routes);

//This syncs the database before opening the port to listen on
sequelize.sync().then(() => {
  app.listen(3000);
});