
const {User, validate} = require('../models/user');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/admin');
const constant = require('../handlers/contants');
const mailer = require('../handlers/mailer');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

 router.get('/',/*[auth, isAdmin]*/ async (req, res) => {
   try {
    const user = await User.find().select('-password -__v').sort("-_id");
    if(user.length > 0){
      console.log(Date.now().toLocaleString())
    return res.status(200).json({message:"All listed users", users:user});

    }else{
    return res.status(200).json({message:'No Users', user})

    }
   }catch(ex){
     console.log(ex)
   }
})



router.get('/:id',  async (req, res) => {
   if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
   return res.send('Invalid ID')
   try {
  const user = await User.findById(req.params.id).select('-password')
  if(!user) return res.send('No user found with the given id')
  res.send(_.pick(user, ["firstname", "phone", "email", "lastname", "isAdmin", "updatedAt", "_id"]));

   }catch(ex) {
    console.log(ex)
   }
})

 router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
 try {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email, 
    phone: req.body.phone,
    password: req.body.password,
    isAdmin:req.body.isAdmin
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt)  
  const savedUser = await user.save();

  if(!savedUser) return res.status(400).json({message:'Something failed, please try again later'})
  if(savedUser) return res.status(200).json({message:'Registeration successful'})
 }catch(ex){
   console.log(ex)
 }
 })

router.put('/passwordupdate',  async (req, res) => {

      let user = await User.find({ email: req.body.email });
      if(!user) return res.status(400).json({message:'Ensure, you enter the email your registered with.'})
      if(user.length <=0) return res.status(400).json({message:'Ensure, you enter the email your registered with.'})
      const salt = await bcrypt.genSalt(10);
      updatePass = await bcrypt.hash(req.body.password, salt);
      const updateOptions = {firstname: req.body.firstname, lastname:req.body.lastname, isAdmin: req.body.isAdmin, email:req.body.email, updatedAt:  Date.now(), password:updatePass};
      const userToUpdatePassword = await User.findByIdAndUpdate(user[0]._id, { $set: updateOptions},{new:true})
      if(!userToUpdatePassword) return res.status(400).json({message:"Operation Failed"})
      if(userToUpdatePassword) return res.status(200).json({message:"User updated successful", userToUpdatePassword})
})
 router.put('/:userId', async (req, res) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.userId)) 
   return res.send('Invalid ID')
    const id = req.params.userId;
    const updateOps = _.pick(req.body, ["firstname", "lastname", "email", "updatedAt", "isAdmin"]);
    try {
    const user = await User.findByIdAndUpdate(id, { $set: updateOps }, {new:true})
    if(!user) return res.status(404).json({message:"Operation failed, No User found"})
    res.status(200).json({message:"Update successfully", user})
    }catch(ex){
      return res.status(500).json({message:"Operation failed", ex})     
    }
});


 router.delete('/:userId', [auth, isAdmin], async (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.userId)) 
    return res.send('Invalid ID')
    try {
        let user = await User.findById(req.params.userId)
        if(!user) return res.send('No user found with the given id')
        const id = req.params.userId;
        user = await User.findByIdAndDelete({ _id: id })
        res.status(200).json({message:"Deleted successful", user:user})
    }catch(ex){
      return res.status(500).json({message:"Operation failed", ex}) 
    }
});


module.exports = router;