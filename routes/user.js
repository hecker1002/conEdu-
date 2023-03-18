const express = require('express');
const router = express.Router();
const User = require('../module/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
// const { forwardAuthenticated } = require('../config/auth');

// This helps us to know which files(pages) at which route (middleware)

router.get('/register', (req,res)=>{res.render("../views/register.ejs")});
router.get('/login', (req,res)=>{res.render("../views/login.ejs")});
router.get('/choice', (req,res)=>{res.render("../views/choice.ejs")});
router.get('/popup', (req,res)=>{res.render("../views/popup.ejs")});




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
