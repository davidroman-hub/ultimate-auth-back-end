const express = require('express')
const router = express.Router()

// import controller




// import validators
const {userSignupValidator} =require('../validators/auth')
const {runValidation} =require('../validators/index')


const{
    
    signup,

} = require('../controllers/auth')


router.post('/signup', userSignupValidator, runValidation, signup)


module.exports = router // {}