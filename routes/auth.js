const express = require('express')
const router = express.Router()

// import controller

const{ signup, accountActivation, signin} = require('../controllers/auth')


// import validators
const {userSignupValidator, userSigninValidator} =require('../validators/auth')
const {runValidation} =require('../validators/index')







router.post('/signup', userSignupValidator, runValidation, signup)
router.post('/signin', userSigninValidator, runValidation, signin)
router.post('/account-activation', accountActivation)


module.exports = router // {}