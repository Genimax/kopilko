const express = require('express');
const path = require('path');
const colors = require('colors');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;
const cookieParser = require('cookie-parser');
const { checkToken } = require('./middleware/cookieJWTAuth');

connectDB();

const app = express();

app.set('views', path.join(__dirname, 'public/pages'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.use('/dashboard', checkToken, require('./routes/dashboardRoutes'));
app.use('/financials', checkToken, require('./routes/financialRoutes'));
app.use('/profile', checkToken, require('./routes/profileRoute'));
app.use('/users', require('./routes/userRoutes'));
app.use('/', require('./routes/mainRoute'));

app.use(errorHandler);

app.listen(port, console.log(`Server started on port: ${port}.`));
