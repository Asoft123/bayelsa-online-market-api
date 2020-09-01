
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi)
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    default:""
  },
  lastname: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    default:""
  },
  
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },

  
  phone: {
    type: String,
    minlength: 11,
    maxlength: 14,
    required:true,
    trim:true,
    default:''
  },
 
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  
   createdAt: {
    type: Date,
    default:Date.now
    
  },
  updatedAt: {
    type: Date,
  },
  isAdmin:{
    type: Boolean,
    default:false
  },
});


userSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin,  email:this.email, lastname:this.lastname, firstname:this.firstname, phone:this.phone  }, config.get('jwtPrivateKey'), 
   { expiresIn: "2h"});
  return token;
}


const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    lastname: Joi.string().min(3).max(50).required(),
    firstname: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    phone: Joi.string().min(11).max(14).required(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

exports.User = User; 
exports.validate = validateUser;
