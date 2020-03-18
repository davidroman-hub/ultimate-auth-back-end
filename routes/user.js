const express = require('express')
const router = express.Router()

// import controller


const{ read } = require('../controllers/user')
const { requireSignin} = require('../controllers/auth')


//routes

router.get('/user/:id', requireSignin , read)




module.exports = router // {}