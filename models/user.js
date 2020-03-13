const mongoose = require('mongoose')
const crypto = require('crypto')

// user Schema

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
        min:3
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true,
        lowercase:true
    },
    hashed_password:{
        type:String,
        required:true,
        min:6
    },
    salt:String,
    role:{
        type:String,
        default:'subscriber'
    },
    resetPasswordLink:{
        data:String,
        default:''
    },
}, {timestamps:true})


// virtual

userSchema.virtual('password')
.set(function(password){
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
})
.get(function(){
    return this._password
})


// methods

userSchema.methods = { 

    //authenticate method

authenticate: function(plaintext){
    return this.encryptPassword(plaintext) == this.hashed_password; //true or false

},

    encryptPassword:function(password){
        if(!password) return ''
        try {
            return crypto.createHmac('sha1', this.salt)
            .update(password)
            .digest('hex')
        } catch(err){
            return ''
        }
    },
    makeSalt:function(){
        return Math.round(new Date().valueOf() * Math.random()) + ''
    }
};

module.exports = mongoose.model('User', userSchema);