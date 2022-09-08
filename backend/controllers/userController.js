const jwt = require('jsonwebtoken');
const path = require('path');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const e = require('express');

// @desc Register New User
// @route /users/registration
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { login, name, password, password2 } = req.body;

  // Form Validation

  if (!login || !name || !password || !password2) {
    res.status(400);
    throw new Error('Заполните все поля');
  }

  // Check if user exists
  const userExists = await User.findOne({ login });

  if (userExists) {
    res.status(400);
    throw new Error('Данный логин уже существует');
  }

  if (login.length > 50 || login.length < 5 || !/^[0-9A-Z]+$/i.test(login)) {
    res.status(400);
    throw new Error(
      'Логин не соответствует требованиям: - Логин не может быть короче 5-ти и длиннее 50-ти символов; - В логине допускаются только латиница и цифры;'
    );
  } else if (
    name.length > 50 ||
    !/^[A-ZА-Я ]+$/i.test(name) ||
    !name.trim().length
  ) {
    res.status(400);
    throw new Error(
      'Имя не соответстует требованиям: - Не может быть длиннее 50-ти символов; - Может содержать только слова разделённые пробелами;'
    );
  } else if (
    password.length < 5 ||
    password.length > 64 ||
    !/(?=.*\d)(?=.*[a-z])/i.test(password)
  ) {
    res.status(400);
    throw new Error(
      'Пароль не соответствует требованиям: - Должен состоять из 5-64 символов; - Латиница и цифры, например: password2022;'
    );
  } else if (password !== password2) {
    res.status(400);
    throw new Error('Пароли не совпадают');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    login,
    name: name.trim(),
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      login: user.login,
      name: user.name,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error(
      'Произошла ошибка при создании пользователя, повторите попытку позднее'
    );
  }
});

// @desc Authentificate A User
// @route /users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { login, password } = req.body;

  // Check for user login
  const user = await User.findOne({ login });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      login: user.login,
      name: user.name,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    // throw new Error('Данные для входа не верны или пользователь не существует');
    res.sendFile(path.join(__dirname, '../public/pages/authFailed.html'));
  }
});

// @desc Login Page
// @route /users/login
// @access Public

const loginPage = asyncHandler(async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/auth.html'));
});

// @desc Get User Data
// @route /users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const { _id, login, name } = await User.findById(req.user.id);

  res.status(200).json({
    id: _id,
    login,
    name,
  });
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

module.exports = { registerUser, loginUser, loginPage, getMe };
