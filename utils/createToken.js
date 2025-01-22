const jwt= require("jsonwebtoken");

const createToken= (payload)=>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {expiresIn: '1d'});

module.exports= createToken;