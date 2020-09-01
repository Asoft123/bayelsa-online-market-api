const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const mailer =require('../handlers/mailer');
const cpass = require('../middleware/confirm_password');
const constant =require('../handlers/contants');
const express = require('express');
const router = express.Router();


// Password Reset
router.post('/', async (req, res)=> {
  if(!req.body.email) return res.status(400).json({message:'Please, enter the email, you used to register'})
   let user = await User.find({ email: req.body.email });
  if(!user) return res.status(400).json({message:'Ensure, you enter the email your registered with.'})
  if(user.length <=0) return res.status(400).json({message:'Ensure, you enter the email your registered with.'})
  const resetPassToken = jwt.sign({email:user[0].email, phone:user[0].phone}, config.get('jwtPrivateKey'),
   { expiresIn:'24h'});
   if(!resetPassToken) return res.status(400).json({message:"Operation failed, please try again later"});
   let resetMessage =  `<div>
                      <img style="width:100px; height:100px;" src='https://easy-app-23.herokuapp.com/uploads/logo.png' alt='hawse.com'/>
                  <div>
                      <strong><span style="font-size: large;">c-hawse.com</span></strong>
                  </div>
                  <div>
                      <p>Please kindly click the link below to start your Password reset process:</p>
                      <a href="https://c-hawse.com/reset_password/${resetPassToken}">https://c-hawse.com/pass_reset/${resetPassToken}</a>

                      <div>
                      <p> <strong>Note: </strong>The password reset link above, expires after 24 hours </p>
                      </div>
                      <p>You are receiving this e-mail because, you requested to reset your password on our platform <a style="text-decoration: none;" href="https://c-hawse.com" target="_blank">c-hawse.com</a></p>
                      <p>Kindly, ignore this message, if you are not the one, who requested for Password reset!</p>
                      <p>Thank you, Team <a style="text-decoration: none;" href="https://c-hawse.com" target="_blank">c-hawse.com</a></p>

                  <p>For more information, call our Customer care on <a href="tel:07038067136">07038067136</a> or email us: <a href="mailto:">info@c-hawse.com</a> </p>
                  </div> 
                </div>`

   mailer.send(
     constant.constants.passwordreset,
     req.body.email,
     "Bayelsa Online Market - Passord Reset",
     resetMessage

   )
  .then(resetM=>{
        res.status(200).json({message:'Password Reset Link successfully sent to your email....'})
    console.log(resetMessage)
   })
   .catch(err => {
          res.status(400).json({message:'Something failed, please try again later'})
   })  
})

router.put('/:token', cpass, async (req, res) => {
      const resetToken = req.params.token;
      if(resetToken.length <= 100) return res.status(400).json({message:'Password reset link invalid'});
      if(!req.body.email) return res.status(400).json({message:'Please, enter the email, you used to register'})
      let user = await User.find({ email: req.body.email });
      if(!user) return res.status(400).json({message:'Ensure, you enter the email your registered with.'})
      if(user.length <=0) return res.status(400).json({message:'Ensure, you enter the email your registered with.'})
      
      if(!user[0].isConfirmed) return res.status(400).json({message:'Ensure, you\'ve not successfully confirmed your account after registration.'})
      const salt = await bcrypt.genSalt(10);
      updatePass = await bcrypt.hash(req.body.password, salt);
      const updateOptions = {password:updatePass};
      const userToUpdatePassword = await User.findByIdAndUpdate(user[0]._id, { $set: updateOptions},{new:true})
      if(!userToUpdatePassword) return res.status(400).json({message:"Password reset Failed"})
      if(userToUpdatePassword) return res.status(200).json({message:"Password reset successful", userToUpdatePassword})
})

module.exports = router;