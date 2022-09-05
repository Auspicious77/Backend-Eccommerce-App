const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const { response } = require('express');
const jwt = require('jsonwebtoken');


//bcrypt is used to hashpassword


router.get(`/`, async (req, res) => {
    //not to get the password when searchong for user
    const userList = await User.find().select('-passwordHash');
    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList);

});

router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        street: req.body.street,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,

    })
    user = await user.save();
    if (!user)
        return res.status(404).send('The user cannot be Registered')

    res.send(user);
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash')

    if (!user)
        return res.status(500).json({ message: 'The user with the Id cannot was not found' })

    res.status(200).send(user);
})

router.post('/login', async(req, res)=>{
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user){
        return res.status(400).send('The user is not found');
    }
    //to change the passwordHash with the user password and compare 
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            //secret is like a password used to create your token
            secret,
            //to set expiring date for token
            // {expiresIn: '1d'}
        )
        res.status(200).send({user: user.email, token: token})
    } else{
        res.status(400).send('Password is wrong');
    }

})

router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        street: req.body.street,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,

    })
    user = await user.save();
    if (!user)
        return res.status(404).send('The user cannot be Registered')

    res.send(user);
})

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments([count => count])
    if (!userCount) {
        res.status(500).json({ success: false })
    }
    //because we return a json
    res.send({ userCount: userCount });

});

//delete users
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then(user => {
            if (user) {
                return res.status(200).json({
                    success: true, message: 'The user has been deleted'
                })
            }
            else {
                return res.status(404).json({
                    success: false, message: "user not found"
                })
            }
        }).catch(err => {
            return res.status(400).json({
                success: false,
                error: err
            })
        })
})

module.exports = router;
