
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {errorHandler} = require('../helpers/dbErrorHandler')
const expressJwt = require('express-jwt')
const _ =  require('lodash')

// sengrid

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


//// funciona perfecto ////


// exports.signup = (req, res) => {
//     //console.log('req.body', req.body);
//     const user = new User(req.body);
//     user.save((err, user) => {
//         if (err){
//             console.log('SIGNUP ERROR', err);
//                 return res.status(400).json({
//                     error: 'Email is taken'
//             });
//         }
//         user.salt = undefined
//         user.hashed_password = undefined
//         res.json({
//             message: 'Signup success! Please signin'
//         })
//     } )
// };



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
 

exports.signup = (req, res) => {
    const { name, email, password } = req.body;

    User.findOne({ email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is taken'
            });
        }

        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account activation link`,
            html: `
                <h1>Please use the following link to activate your account</h1>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                <hr />
                <p>This email may contain sensetive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `
        };

        sgMail
            .send(emailData)
            .then(sent => {
                // console.log('SIGNUP EMAIL SENT', sent)
                return res.json({
                    message: `Email has been sent to ${email}. Follow the instruction to activate your account`
                });
            })
            .catch(err => {
                // console.log('SIGNUP EMAIL SENT ERROR', err)
                return res.json({
                    message: err.message
                });
            });
    });
};


// account activation afetr the email 

exports.accountActivation = (req, res) => {
    const { token } = req.body;

    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded) {
            if (err) {
                console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err);
                return res.status(401).json({
                    error: 'Expired link. Signup again'
                });
            }

            const { name, email, password } = jwt.decode(token);

            const user = new User({ name, email, password });

            user.save((err, user) => {
                if (err) {
                    console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err);
                    return res.status(401).json({
                        error: 'Error saving user in database. Try signup again'
                    });
                }
                return res.json({
                    message: 'Signup success. Please signin.'
                });
            });
        });
    } else {
        return res.json({
            message: 'Something went wrong. Try again.'
        });
    }
};






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

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET // req.user._id //<<== esasy for search the users
})

// to block some funtionalities for the user like a upload, but you can block whatever you Want
//Restrict !
exports.adminMiddleware = (req,res,next) => {
    User.findById({ _id: req.user._id}).exec((err,user)=>{
        if (err || !user){
            return res.status(400).json({
                error:'User not found'
            })
        }
        if (user.role !== 'admin'){
            return res.status(400).json({
                error:'Admin resource. Access denied'
            })
        }
        req.profile = user
        next()
    })
}
// forgot password and reset

exports.forgotPassword = (req,res) => {
    const {email} = req.body
    User.findOne({email},(err,user) => {
        if(err || !user){
            return res.status(400).json({
                error: "User with that email doent not exist"
            })
        } 
        const token = jwt.sign({ _id: user._id}, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `PASSWORD RESET link`,
            html: `
                <h1>Please use the following link to reset your password</h1>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr />
                <p>This email may contain sensetive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `
        };
        
        return user.updateOne({resetPasswordLink: token}, (err, success)=>{
            if (err){
                console.log('Reset passsword link error', err);
                return res.status(400).json({
                    error:'Database connection error on user password forgot request'
                })
            } else {
                    sgMail
                .send(emailData)
                .then(sent => {
                    // console.log('SIGNUP EMAIL SENT', sent)
                    return res.json({
                        message: `Email has been sent to ${email}. Follow the instruction to activate your account`
                    });
                })
                .catch(err => {
                    // console.log('SIGNUP EMAIL SENT ERROR', err)
                    return res.json({
                        message: err.message
                    });
                });

            }
        })

    })
}


exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded) {
            if (err) {
                return res.status(400).json({
                    error: 'Expired link. Try again'
                });
            }

            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        error: 'Something went wrong. Try later'
                    });
                }

                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                };

                user = _.extend(user, updatedFields);

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Error resetting user password'
                        });
                    }
                    res.json({
                        message: `Great! Now you can login with your new password`
                    });
                });
            });
        });
    }
};