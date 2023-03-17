const express =  require('express');
require('dotenv').config()
const expressLayouts = require('express-ejs-layouts')   //middleware for layout rendering
const mongoose = require('mongoose');               // eligible to be called as middleware??
const passport = require('passport');         
const session = require('express-session');      // middleware for passport authentication
const flash = require('connect-flash');            // fo rflash middleware



//passport Config
require('./config/passport')(passport);

//DB Mongoos connect

const db = require('./config/keys.js').MongoURI;

mongoose.connect(db, {useNewUrlParser : true})
.then(()=>console.log("MongoDB Connected ..."))
.catch(err=>console.log(err))


// express instantiation
const app = express();

app.use(expressLayouts);                //middleware will modify our res.render() calls
app.set('view engine', 'ejs');          // this engine is used to separate the presentation logic from the application logic.

// bodyParser

app.use(express.urlencoded( {extended: false}));        //??

//static file addition
app.use(express.static(__dirname + '/public'));


// Express session - something to do with converting of user Object to a serialized ID(?), which will maintain throughout the session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



// Connecting the FLASH
app.use(flash());
// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });



//Routes
app.use('/', require('./routes/index'));
app.use('/user', require('./routes/user'));




const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started listening on ${PORT} port`));
