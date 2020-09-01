
const { User } = require('../models/user')
const auth = require('../middleware/auth');
const Admin = require('../middleware/admin');
const {validate, Marketer} = require('../models/marketer')
const mongoose = require('mongoose');
const _ = require('lodash')
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    try{
    const marketers = await Marketer.find().sort('-_id').populate('uploadBy', "firstname lastname phone email -_id")
    if(marketers.length > 0){
        return res.status(200).json({
            message: 'House Fetch successful',
           marketers
        })
    } else {
        return res.status(200).json({message:'No Marketer Listed yet!',marketers})
    }
    }catch(ex){
         return res.status(500).json({message:'Something Failed!'})
    }
})

router.post('/',  async (req, res) => {
    
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
   
    if(!mongoose.Types.ObjectId.isValid(req.body.uploadBy))
            return res.status(400).send('Invalid user id')
    try {
    const user = await User.findById(req.body.uploadBy);
    if (!user) return res.status(400).send('Invalid user in db.');
      let newMarketer = await Marketer.find({ phone: req.body.phone }); 
      if (newMarketer) return res.status(400).send('Marketer already registered.');


        let marketer = new Marketer({
            firstname:req.body.firstname,
            lastname: req.body.lastname,
            bizName: req.body.bizName, 
            address: req.body.address,
            isVerified: req.body.isVerified, 
            uploadBy:{
                _id: user._id,
                firstname: user.firstname,
                email: user.email,
                phone: user.phone
            }, 
            facebook: req.body.facebook, 
            instagram:req.body.instagram,
            whatsapp: req.body.whatsapp, 
        
        });
        const success = await marketer.save(); 
            
        if(!success) return res.status(400).json({message:"Operation Failed"})
        if(success) return res.status(201).json({message: 'Marketer Added successfully'})
    }
    catch(ex){
        res.status(500).json({message:"Something failed"})
        console.log(ex)
    }
})


router.get('/:id', async (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
   return res.send('Invalid ID')
 try{
   const marketer = await House.findById(req.params.id).populate('uploadBy', "firstname lastname phone")
   if(!house) {
       return res.status(404).json({message:'No Marketer found with the given id'})
    } else {
        return res.status(200).json({
            message: 'Marketer fetched successful',
            marketer
        })
    }
    }catch(ex){
       return res.status(500).json({message:'Something Failed'})
        
    }
})
router.get('/uploadby/:id', [auth], async (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) 
    return res.send('Invalid ID')
    try{
        const marketers = await Marketer.find({uploadBy:req.params.id}).exec()
        if(marketers.length <= 0) {
            return res.status(200).json({message:"You've not registered any Marketer yet!"})
            } else {
                return res.status(200).json({
                    message: 'Your Listed Marketers',
                    marketers
                })
            }
        }catch(ex){
            return res.status(500).json({message: 'Something Failed'})
        }
})

router.put('/:id', async (req, res) => {
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({message:"Invalid id"})
    
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
    try {
        const user = await User.findById(req.body.uploadBy);
        if (!user) return res.status(400).jsonsend({message:'Invalid user in db.'});
        const marketer = await Marketer.findByIdAndUpdate(req.params.id,
            {
                firstname:req.body.firstname,
                lastname: req.body.lastname,
                bizName: req.body.bizName, 
                address: req.body.address,
                isVerified: req.body.isVerified, 
                uploadBy:{
                    _id: user._id,
                    firstname: user.firstname,
                    email: user.email,
                    phone: user.phone
                }, 
                facebook: req.body.facebook, 
                instagram:req.body.instagram,
                whatsapp: req.body.whatsapp,
                updatedAt:  Date.now() 
            
            }, { new: true });

        if (!marketer) return res.status(404).json({message:'The Marketer with the given ID was not found.'});
    
        res.send(marketer);
    }
    catch(ex){
       return res.status(500).json({message:'Something Failed'}); 
    }
});


router.delete('/:id',  async (req, res) => {
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send("Invalid id");
    try{
        let marketer = await Marketer.findById(req.params.id);
        if (!marketer) return res.status(404).send('The Marketer with the given ID was not found.');;
        marketer = await Marketer.find({_id: id}).remove().exec();
        res.status(200).json({message:"Deleted successful", marketer:marketer})
    }
    catch(ex){
        res.status(500).json({message:"Something Failed"})
    }
});


module.exports = router;
