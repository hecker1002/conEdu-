const express = require('express');
const router = express.Router();
const User = require('../module/User');
const Forum = require('../module/Forum');
const Question = require('../module/Question')
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { MongoClient } = require('mongodb');

const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth');
const db = require('../config/keys.js').MongoURI;


const client = new MongoClient(db);
// This helps us to know which files(pages) at which route (middleware)

router.get('/forum', (req,res)=>{res.render("../views/forum.ejs")})
router.get('/register', (req,res)=>{
    res.render(
        "../views/register.ejs",
        {message : false})});

router.get('/login', (req,res)=>{
    const message = req.flash();
    console.log(message)
    // res.render('thank-you', { message });
    res.render("../views/login.ejs", { message })
});

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
router.get('/createhack',ensureAuthenticated, (req,res)=>{res.render("../views/createhack.ejs")});
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
        const solverId = req.session.passport.user;
        const questionId = req.params.id;
        const userAnswer = req.body.answer;
        
        // find the question in the database
        const question = await Question.findById(questionId);
        const solver = await User.findById(solverId);
        console.log(userAnswer);
        console.log(question);
        
        // check if the user's answer matches the correct answer
        if (userAnswer === question.data[`${question.data.correct}`]) {

            await client.connect();

            const collection = client.db('mydatabase').collection('mycollection');
            const newsolver = { ...solver, score : solver.score+10,}
            // console.log(newsolver.score)
            const result = await collection.updateOne(solverId , { $set: newsolver });

            res.render('../views/mcq.ejs',{
                question: question,
                success : true,
                fail : false
            });
            } 
            else {
            const questioner = await User.findById(question.creatorId);
            const newuser = User({
                name : questioner.name,
                email : questioner.email,
                password : questioner.password,
                datecreated : questioner.datecreated,
                school: questioner.school,
                achievements: questioner.achievements,
                about: questioner.about,
                score : questioner.score+10,
                dateupdated: questioner.dateupdated
            });
            newuser.save()
            .then(user => {
                // req.flash(
                //     'success_msg',
                //     'You are now registered and can log in'
                //   );
                req.flash('success', 'Score updated');
            })
            .catch(err=>{console.log(err)});
            res.render('../views/mcq.ejs',{
                question : question,
                success : false,
                fail : true
            });

            const newsolver = User({
                name : solver.name,
                email : solver.email,
                password : solver.password,
                datecreated : solver.datecreated,
                school: solver.school,
                achievements: solver.achievements,
                about: solver.about,
                score : solver.score-5,
                dateupdated: solver.dateupdated


            })
            newsolver.save()
            .then(user => {
                // req.flash(
                //     'success_msg',
                //     'You are now registered and can log in'
                //   );
                req.flash('success', 'Score updated');
            })
            .catch(err=>{console.log(err)});
            }
        } 
        catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    });
      

module.exports = router;

      
router.post('/createhack', (req, res) => {
    // Extract form data from the request
    const formData = req.body;
    const creatorId = req.session.passport.user;
    // Create a new Form instance using the model
    const form = new Question({
      data: formData,
      creatorId: creatorId
    });
  
    // Save the form data to MongoDB
    form.save()
    .then(user => {
        res.redirect('/user/choice');
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
                    name : name,
                    email : email,
                    password : password,
                    datecreated : Date.now(),
                    score : 0
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
                                    // req.flash(
                                    //     'success_msg',
                                    //     'You are now registered and can log in'
                                    //   );
                                    req.flash('success', 'Form submitted successfully');
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

router.post('/login',(req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/user/login?error=Invalid%20username%20or%20password',
    })(req, res, next);
  });

// Logout

router.get('/profile',ensureAuthenticated, async (req,res)=>{
    console.log(req.session)
    // res.render("../views/profile.ejs")
    const studentId = req.session.passport.user;
    const student = await User.findById(studentId);
    console.log(student)
    res.render('profile', { student });
});


router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/user/login');
    });
  });

router.get('/logout_welcome', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

module.exports = router;
