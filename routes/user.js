const express = require('express');
const router = express.Router();
const User = require('../module/User');
const Question = require('../module/Question')
const bcrypt = require('bcryptjs');
const passport = require('passport');
// const { forwardAuthenticated } = require('../config/auth');

// This helps us to know which files(pages) at which route (middleware)

router.get('/register', (req,res)=>{res.render("../views/register.ejs")});
router.get('/login', (req,res)=>{res.render("../views/login.ejs")});
router.get('/choice', (req,res)=>{res.render("../views/choice.ejs")});
router.get('/createhack', (req,res)=>{res.render("../views/createhack.ejs")});
router.get('/hackit', async (req,res)=> {
    console.log('entered')
    try{
        const question = await Question.find().sort({ createdAt: 'desc' });
        res.render("../views/hackit.ejs", { question })
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
    })

router.get('/hackit/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.render('post', { post });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
    });
      

router.post('/createhack', (req, res) => {
    // Extract form data from the request
    const formData = req.body;
    // Create a new Form instance using the model
    const form = new Question({
      data: formData
    });
  
    // Save the form data to MongoDB
    form.save()
    .then(user => {
        res.redirect('/user/login');
    })
    .catch(err=>{console.log(err)});
});

router.post('/register/formation', (req,res)=>{
    const {name, email, password, password2} = req.body;
    let errors = [];

    if(!name || !email || !password || !password2)
    {
        errors.push({msg : "Please fill in all fields"});
    }
    
    if(password!=password2)
    {
        errors.push({msg : "Passwords does not match"});
    }

    if(password.length<6)
    {
        errors.push({msg : "Please input the password with length atleast of 6 characters"});
    }

    if(errors.length>0)
    {
        res.render('../views/register.ejs',{
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else{
        User.findOne({email: email})
        .then(user=>
            {if(user){
                errors.push({msg : "This email is already registered"})
                res.render("../views/register.ejs", {
                    errors,
                    name,
                    email,
                    password,
                    password2
                })

            }
            else{
                const newuser = User({
                    name,
                    email,
                    password,
                });
                
                bcrypt.genSalt(10, (err, salt)=> {
                    if(err) throw err;
                    else{
                        bcrypt.hash(newuser.password, salt, (err, hash)=>{
                            if(err) throw err;
                            else
                            {
                                newuser.password = hash;
                                newuser.save()
                                .then(user => {
                                    req.flash(
                                        'success_msg',
                                        'You are now registered and can log in'
                                      );
                                    res.redirect('/user/login');
                                })
                                .catch(err=>{console.log(err)});
                            }
                        })
                    }
                    
                })

            }
        }
        )
        
    }
});

// login POST

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/user/login',
      failureFlash: true
    })(req, res, next);
  });

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/user/login');
});

module.exports = router;
