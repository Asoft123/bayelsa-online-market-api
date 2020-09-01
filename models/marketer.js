const mongoose = require('mongoose')
const Joi = require('@hapi/joi')
 
const marketerSchema = new mongoose.Schema({
   
  
    firstname: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },

    lastname: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    bizName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    address: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 255,
        lowercase:true
    },
    facebook:  {
        type: String,
        trim:true,
        default:""
    },
    instagram:  {
        type: String,
        trim:true,
        default:""
    },
    whatsapp: {
    type: String,
    trim:true,
    default:''
  },
  
    isVerified: { 
    type: Boolean, 
    default:false
  },
  uploadBy:{
      type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true
  }, 
 
 
  createdAt: {
    type: Date,
    default:Date.now
    
  },
  updatedAt: {
    type: Date,
  }
})

const Marketer = mongoose.model('Marketer', marketerSchema)

function validateMarketer(marketer) {
    const schema = Joi.object({
        firstname: Joi.string().min(3).max(50).required(),
        lastname: Joi.string().min(3).max(50).required(),
        bizName: Joi.string().min(3).max(200).required(),
        address: Joi.string().min(10).max(255).required(),
        uploadBy: Joi.string().min(24).max(25).required(),
        facebook: Joi.string().min(20).max(100),
        instagram: Joi.string().min(20).max(100),
        whatsapp: Joi.string().min(11).max(14),
        phone: Joi.string().min(11).max(14),
        isVerified: Joi.boolean()
    })
    return schema.validate(marketer)
}

exports.Marketer= Marketer
exports.validate = validateMarketer