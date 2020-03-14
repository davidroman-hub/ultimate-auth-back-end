
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {errorHandler} = require('../helpers/dbErrorHandler')



/// normal sign up without message auth
// exports.signup = (req, res) => {
//         // console.log('REQ BODY ON SIGNUP', req.body);
//         const { name, email, password } = req.body;
    
//         User.findOne({ email }).exec((err, user) => {
//             if (user) {
//                 return res.status(400).json({
//                     error: 'Email is taken'
//                 });
//             }
//         });
    
//         let newUser = new User({ name, email, password });
    
//         newUser.save((err, success) => {
//             if (err) {
//                 console.log('SIGNUP ERROR', err);
//                 return res.status(400).json({
//                     error: err
//                 });
//             }
//             res.json({
//                 message: 'Signup success! Please signin'
//             });
//         });
//     };


//// funciona perfecto ////


exports.signup = (req, res) => {
    //console.log('req.body', req.body);
    const user = new User(req.body);
    user.save((err, user) => {
        if (err){
            console.log('SIGNUP ERROR', err);
                return res.status(400).json({
                    error: 'Email is taken'
            });
        }
        user.salt = undefined
        user.hashed_password = undefined
        res.json({
            message: 'Signup success! Please signin'
        })
    } )
};



/**
 * if you used approach signup user in real world app
 * no problems it works but you will be saving alot of junk user in your database
 * people will signup with whatever email and it works..
 * so lets use the concep of email confirmations
 * when they want to signup, we will send them an email
 * if they used valid email only then they will be able see the confirmations
 * on that email we will send the user signup information encoded in jwt 
 * there will also be a url link
 * upon clicking on that url, they will taken to our client/react
 * where will grav that encoded jwt.. wich contains user info to create
 * then we make request to backend using our react app so that user is finall sign in
 * lets do it. 
 */


// the new sign up for the auth with email sendgrid
// we need to use the package @sengrid/email
 
// exports.signup = (req,res) =>{
//      //
//  }


/// Sign in ///

/*
 *check if the user is trying to signin but havent signup yet
 check if pasword mathc with hashed_password that saved in db
 if yes, generate token with expiry
 the token will be sent to client/react
 it will be used as jwt based authenticated systme
 we can allow user to access protected routres later if they have valid token
 so jwt is like password with expriry
 in succes signin we wll send user info and valid token to clientthis token will be send back to server from client/react to acces protect 
 * 
 */






exports.signin = (req,res) => {
    const {email, password} = req.body
    // check if the user exist
    User.findOne({email}).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:'User with that email doesnt exist, please Sign up!'
            })
        }
        //Authenticate
         if(!user.authenticate(password)){
             return res.status(400).json({
                 error:"Email and password doesnt match"
             })
         }
         // generate the token and send to client
         const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'})
         const {_id,name, email, role} = user

         return res.json({
             token,
             user:{_id,name, email, role}
             })
        })
}