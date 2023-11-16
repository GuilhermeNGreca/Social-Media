const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;

// Gerando o token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
};

// Registrando e Logando
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Checando se o usuário existe
  const user = await User.findOne({ email });
  if (user) {
    res.status(422).json({ errors: ["Por favor, utilize outro e-mail!"] });
    return;
  }

  //Gerando a senha hash
  const salt = await bcrypt.genSalt(); //gera a string aleatória
  const passwordHash = await bcrypt.hash(password, salt);

  // Criando usuário
  const newUser = await User.create({
    name,
    email,
    password: passwordHash,
  });

  // Se o usuário foi criado com sucesso, gera o token
  if (!newUser) {
    res
      .status(422)
      .json({ errors: ["Houve um erro, por favor tente novamente!"] });
    return;
  }

  res.status(201).json({
    _id: newUser._id,
    token: generateToken(newUser._id),
  });
};

// criando o login
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  //checando se o usuário existe
  if (!user) {
    res.status(404).json({ errors: ["Usuário não encontrado!"] });
    return;
  }

  //checando se a senha é igual a enviada pelo usuário
  if (!(await bcrypt.compare(password, user.password))) {
    res.status(422).json({ errors: ["Senha inválida!"] });
    return;
  }

  //retornando usuário com o token
  res.status(201).json({
    _id: user._id,
    profileImage: user.profileImage,
    token: generateToken(user._id),
  }); //criação com sucesso
};

// Obter o usuário logado atual
const getCurrentUser = async (req, res) => {
  const user = req.user;
  res.status(200).json(user);
};

// update do usuário
const update = async (req, res) => {
  const { name, password, bio } = req.body;

  let profileImage = null;
  if (req.file) {
    profileImage = req.file.filename;
  }

  const reqUser = req.user;

  const user = await User.findById(
    new mongoose.Types.ObjectId(reqUser._id)
  ).select("-password");

  if (name) {
    user.name = name;
  }

  if (password) {
    //gerando senha hash
    const salt = await bcrypt.genSalt(); //gera a string aleatória
    const passwordHash = await bcrypt.hash(password, salt);

    user.password = passwordHash;
  }

  if (profileImage) {
    user.profileImage = profileImage;
  }

  if (bio) {
    user.bio = bio;
  }

  await user.save();

  res.status(200).json(user);
};

//pegando o usuário pelo id
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(new mongoose.Types.ObjectId(id)).select(
      "-password"
    );

    //checando se usuário existe
    if (!user) {
      res.status(404).json({ errors: ["Usuário não encontrado!"] });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ errors: ["Usuário não encontrado!"] });
    return;
  }
};

// Disponibilizando as funções para as rotas
module.exports = {
  register,
  login,
  getCurrentUser,
  update,
  getUserById,
};
