const express = require('express')
const router = new express.Router()
const User = require('../model/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account')
router.post('/user', async (req, res) => {
    var user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateToken()
        res.status(201).send({user , token})
    } catch(e) {
        res.status(400).send(e)
    }
})

router.post('/user/login', async (req, res) => {
    try{
        const user = await User.loginByCredential(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.status(200).send({ user, token})
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter( (token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/user/logoutall', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send(e)
    }
})

router.get('/user/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/user', auth, async (req, res) => {
    try{
        const users = await User.find({})
        res.send(users)
    } catch(e) {
        res.status(500).send(e)
    }
})

// router.get('/user/:id', async (req, res) => {
//     try{
//         console.log(req.params.id)
//         const user = await User.findById(req.params.id)
//         if(!user){
//             return res.status(404).send(user) 
//         }
//         console.log(user)
//         res.send(user)
//     } catch(e) {
//         res.status(500).send(e)
//     } 
// })

router.patch('/user/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdates = ['email', 'password', 'name', 'age']
    const isValidOper = updates.every((update) => allowUpdates.includes(update) )
    if(!isValidOper){
        return res.status(400).send({ error : 'Invalid updates' })
    }
    try{
        updates.forEach( update => req.user[update] = req.body[update] )
        await req.user.save()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})
router.delete('/user/me', auth, async (req, res) => {
    try{
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

const upload = multer({
    limits : {
        fileSize : 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error("User not found")
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send(e)
    }
    
})

module.exports = router