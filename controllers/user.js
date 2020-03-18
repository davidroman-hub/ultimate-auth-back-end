const User = require('../models/user')

// the method to get the information of the user

exports.read = (req,res) => {
    const userId = req.params.id
    User.findById(userId).exec((err,user) => {
        if(err || !user){
            return res.status(400).json({
                error:'User not found'
            })
        } 
        res.json(user)
    })
}