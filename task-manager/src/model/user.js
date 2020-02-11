const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 7,
        validate(password){
            if(password.toLowerCase().includes('password')){
                throw Error("Invalid password")
            }
        }
    },
    email : {
        type : String,
        trim : true,
        unique : true,
        required : true,
        validate(email){
            if(!validator.isEmail(email)){
                throw Error('Not a valid Email')
            }
        }
    },
    age : {
        type : Number,
        validate(value){
            if(value < 0){
                throw Error('Age must be positive')
            }
        }
    },
    tokens : [{
        token : {
            type : String,
        }
    }],
    avatar : {
        type : Buffer
    }
}, {
    timestamps : true
})

userSchema.virtual('tasks', {
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
})

userSchema.methods.generateToken = async function(){
    const user = this
    const token = jwt.sign({_id : user._id.toString()}, 'thisisjsonwebtoken')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON =  function(){
    const user = this;
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.statics.loginByCredential = async (email, password) => {
    const user = await User.findOne({ email })
    if(!user) {
        throw new Error('Unable to login !!!')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch ){
        throw new Error('Unable to login !!!')
    }
    return user
}

userSchema.pre('save', async function(next) {
    const user = this //This is pointing to currently dicument
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ owner : user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User