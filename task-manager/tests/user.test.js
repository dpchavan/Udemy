const request = require('supertest')
const app = require('../src/app')
const User = require('../src/model/user')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const userId = new mongoose.Types.ObjectId()

userOne = {
    _id : userId,
    name : "Mike",
    email : "mike@gmail.com",
    password : "Mike@1234",
    tokens : [{
        token : jwt.sign({_id : userId}, process.env.JWT_SECREAT)
    }]
}

beforeEach( async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should signup a new user', async () => {
    const response = await request(app)
    .post('/user')
    .send({
        name : "Prasad",
        email : "prasad@gmail.com",
        password : "Prasad@1234"
    })
    .expect(201)
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    expect(response.body).toMatchObject({
        user : {
            name : 'Prasad',
            email : 'prasad@gmail.com'
        },
        token : user.tokens[0].token
    })
})

test('Login exsting user', async () => {
    const response = await request(app)
    .post('/user/login')
    .send({
        email : userOne.email,
        password : userOne.password
    }).expect(200)
    const user = await User.findById(userId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Read profile', async () => {
    await request(app)
    .get('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for Unautheticated user', async () => {
    await request(app)
    .get('/user/me')
    .send()
    .expect(401)
})

test('Delete profile', async () => {
    await request(app)
    .delete('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    const user = await User.findById(userId)
    expect(user).toBeNull()
})

test('Should not Delete profile for Unautheticated', async () => {
    await request(app)
    .delete('/user/me')
    .send()
    .expect(401)
})