const express = require('express')
const router = express.Router()

router.get('/signup', (req,res) => {
    res.json({
        data:'you hit signups endpoint'
    })
})

module.exports = router // {}