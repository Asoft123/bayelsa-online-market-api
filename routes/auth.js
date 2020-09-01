const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();



router.post('/',  async (req, res) => {

  const { error } = validateLog(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
 try{
  let user = await User.findOne({ email: req.body.email });
  console.log(user)
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  console.log(validPassword)
  if (!validPassword) return res.status(400).send('Invalid email or password b.');
  const token = user.generateAuthToken();
  res.send(token);
  }catch(ex){
    console.log(ex)
  }
});

function validateLog(user) {
  const schema = Joi.object({
    
    email: Joi.string().min(5).max(255).required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().min(5).max(255).required()
  });

  return schema.validate(user);
}



router.put('/:token', async (req, res)=> {
  const token = req.params.token;
 
   if (!token) return res.status(401).json({message:'Invalid Account confirmation link'});
   if(token.length <= 100) res.status(401).json({message:'Invalid Account confirmation link, please Click the link send to email'});
  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
   
   
    if(decoded){
      if(Date.now() >= decoded.exp * 1000) return res.status(401).json({message:'Expired Account confirmation link'});

      if(!decoded.email) return res.status(400).json({message:'Invalid confirmation link'})
      let user = await User.find({ email: decoded.email });
      if(!user) return res.status(400).send('Ensure, you enter the email your registered with.')
      if(user.length <=0) return res.status(400).json({message:'Ensure, you enter the email your registered with.'});
      if(user[0].isConfirmed) return res.status(400).json({message:'Acconut Already Confirmed, please proceed to login'})

      const updateOptions = {isConfirmed:true};
      const userToConfirmAct = await User.findByIdAndUpdate(user[0]._id, { $set: updateOptions},{new:true})
      if(!userToConfirmAct) return res.status(400).json({message:"Account Confirmation Failed, Please try again later."})
      if(userToConfirmAct) return res.status(200).json({message:"Account Confirmed Successfully, please proceed to login"})
      } 
  }
  catch (ex) {
    res.status(400).json({message:'Expired Account confirmation link'});
  }
})

module.exports = router; 
