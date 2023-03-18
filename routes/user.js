const express = require('express');
const router = express.Router();
const User = require('../module/User');
const Forum = require('../module/Forum');
const Question = require('../module/Question')
const bcrypt = require('bcryptjs');
const passport = require('passport');
// const { forwardAuthenticated } = require('../config/auth');

// This helps us to know which files(pages) at which route (middleware)

router.get('/forum', (req,res)=>{res.render("../views/forum.ejs")})
router.get('/register', (req,res)=>{res.render("../views/register.ejs")});
router.get('/login', (req,res)=>{res.render("../views/login.ejs")});
router.get('/choice', (req,res)=>{res.render("../views/choice.ejs")});
router.get('/hackit/:id', async (req, res) => {
    try {
      const question = await Question.findById(req.params.id);
      res.render('../views/mcq.ejs', {
         question,
         success : false,
         fail : false });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
router.get('/createhack', (req,res)=>{res.render("../views/createhack.ejs")});
router.get('/hackit', async (req,res)=> {
    console.log('entered')
    try{
        const question = await Question.find().sort({ createdAt: 'desc' });
        console.log('entered2')
        res.render("../views/hackit.ejs", { question })
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
    })
router.get('/yourtalkdesk', async (req,res)=> {
    console.log('entered')
    try{
        const forum = await Forum.find().sort({ createdAt: 'desc' });
        console.log('entered2')
        res.render("../views/yourtalkdesk.ejs", { forum })
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

      
    // router.post('/check-answer', async (req, res) => {
    //     console.log(req.body)
    //     // const keys = Object.keys(req.body)
    //     // try {
    //     //   const question = await Question.findById(keys[0]);
    //     //   const answer = question.data.correct;
      
    //     //   // check if answer is correct
    //     //   if (req.body.selectedOption === answer) {
    //     //     res.send('Correct answer!');
    //     //   } else {
    //     //     res.send('Incorrect answer!');
    //     //   }
    //     // } catch (err) {
    //     //   console.error(err);
    //     //   res.status(500).send('Internal Server Error');
    //     // }
    //   });

router.post('/forum', (req, res) => {
    console.log(req.body)
    // Extract form data from the request
    const formData = req.body;
    // Create a new Form instance using the model
    const form = new Forum({
      name : formData.name,
      content : formData.content
    });
  
    // Save the form data to MongoDB
    form.save()
    .then(user => {
        res.redirect('/user/yourtalkdesk');
    })
    .catch(err=>{console.log(err)});
});

router.post('/check-answer/:id', async (req, res) => {
    console.log(req.body);
    try {
        const questionId = req.params.id;
        const userAnswer = req.body.answer;
        
        // find the question in the database
        const question = await Question.findById(questionId);
        console.log(userAnswer);
        console.log(question);
        
        // check if the user's answer matches the correct answer
        if (userAnswer === question.data[`${question.data.correct}`]) {
            res.render('../views/mcq.ejs',{
                question: question,
                success : true,
                fail : false
            });
            } else {
            res.render('../views/mcq.ejs',{
                question : question,
                success : false,
                fail : true
            });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    });
      

module.exports = router;

      
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
