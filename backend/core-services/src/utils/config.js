module.exports = {
  secret: process.env.JWT_SECRET,
  saltRounds: parseInt(process.env.SALT_ROUNDS) || 10
};