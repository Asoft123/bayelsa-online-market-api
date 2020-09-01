const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  const token = req.body.restToken;
  if (!token) return res.status(400).json({message:'Invalid Password reset link'});
  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    if(decoded && decoded.exp){
      if(Date.now() >= decoded.exp * 1000) return res.status(400).json({message:'Expired Password reset link'});
      
    next();
      } 
  }
  catch (ex) {
    res.status(400).json({message:'Expired link, please goto forgot password and resend link again.'});
  }
}