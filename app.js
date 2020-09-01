const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi);
const config = require('config');
const users = require('./routes/users');
const reset_password = require('./routes/reset_password');
const marketers = require('./routes//marketers');
const auth = require('./routes/auth');
const express = require('express');;
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Connect to DB
mongoose.Promise = global.Promise;
mongoose.connect(config.get('db'),
 { useNewUrlParser: true,
  useUnifiedTopology: true  })
    .then(() => console.log('connected to MongoDB....'))
    .catch(err => console.log(err));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({});
    }
    next();
});

app.use('/api/users', users);
app.use('/api/marketers', marketers)
app.use('/api/auth', auth)
app.use('/api/reset_password', reset_password)



module.exports = app
