const express = require('express')
const router = express.Router()

// import controller

const{
    
    signup,

} = require('../controllers/auth')


router.post('/signup', signup)


module.exports = router // {}