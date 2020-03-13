const express = require('express')
const router = express.Router()

// import controller




// import validators
const {userSignupValidator, userSigninValidator} =require('../validators/auth')
const {runValidation} =require('../validators/index')


const{ signup, signin} = require('../controllers/auth')




router.post('/signup', userSignupValidator, runValidation, signup)
router.post('/signin', userSigninValidator, runValidation, signin)


module.exports = router // {}