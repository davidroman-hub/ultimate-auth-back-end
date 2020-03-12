
const User = require('../models/user')


exports.signup = (req, res) => {
  //  console.log('req body on signup', req.body)
  
// the values that we gonna use
const {name, email, password} = req.body

// to only one user for one email address
User.findOne({email}).exec((err, user) => {
if(user){
    return res.status(400).json({
        error:'Email is taken chose another'
            })
        }
    })
    let newUser = new User({name, email, password})

    // set in the data base 
    newUser.save((err, success) => {
        if(err){
            console.log('sign up ERROR', err)
            return res.status(400).json({
                error:err
            })
        }
        res.json({
            message:'Sign up success!'
        })
    })
}