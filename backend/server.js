const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.use('/user/incomes', require('./routes/incomesRoutes'));
app.use('/users', require('./routes/userRoutes'));

app.use(errorHandler);

app.listen(port, console.log(`Server started on port: ${port}.`));
