const mongoose = require("mongoose");
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const conn = async () => {
  try {
    const dbConn = await mongoose.connect(
      `mongodb+srv://${dbUser}:${dbPassword}@redesocial.j1jybwo.mongodb.net/?retryWrites=true&w=majority`
    );
    console.log("Conectou ao banco de dados");
    return dbConn;
  } catch (error) {
    console.log(error);
  }
};
conn();

module.exports = conn;
