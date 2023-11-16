const User = require("../models/User");
const jwt = require("jsonwebtoken"); //comparação do token
const jwtSecret = process.env.JWT_SECRET;
require("dotenv").config();

const authGuard = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  //checando se o header tem o token
  if (!token) {
    return [res.status(401).json({ errors: ["Acesso negado!"] })];
  }

  //checando se o token é válido
  try {
    const verified = jwt.verify(token, jwtSecret);
    req.user = await User.findById(verified.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ errors: ["Token inválido!"] });
  }
};
module.exports = authGuard;
