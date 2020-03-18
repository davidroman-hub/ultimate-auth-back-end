const express = require('express')
const router = express.Router()

// import controller


const{ read, update } = require('../controllers/user')
const { requireSignin} = require('../controllers/auth')


//routes

router.get('/user/:id', requireSignin , read)
router.put('/user/update', requireSignin , update)




module.exports = router // {}