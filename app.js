var express = require('express');
var bodyPaser = require('body-parser');
var bcrypt = require('bcryptjs');
var session =require('client-sessions');
var csurf = require('csurf');
var path = require('path');
//================db===================//
var mongoose = require('mongoose');
var User = require('./model');
//================db===================//
//HTTP/1.1 302 Moved Temporarily
//X-Powered-By: Express
//Location: /dashboard
//Vary: Accept
//Content-Type: text/html; charset=utf-8
//Content-Length: 76
//Set-Cookie: session=WJ-DKs81zqaS2kxc-Yac-g.yWtyx4Y2Vnfec2HXcrsYf1qHIRXNlq4qMLzf1wJ3nBjEAfR8zeVeCk0t_HiutO3kykxgyapqgGkY3QR3CKJmGFLkutFqcTOTNvUflq4LrDRDcky0F5qyEoUsv3fO-8PT2p2VihX0-WfgackViUHHMQ.1418264838139.1800000.re47qsqQVsOJZWTcH1mp3JJP2KXifZw119g-iTs9KpA; path=/; expires=Thu, 11 Dec 2014 02:57:19 GMT; httponly
//Date: Thu, 11 Dec 2014 02:27:18 GMT
//Connection: keep-alive


var app =express();
app.set('view engine', 'ejs');

var port = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost/newauth')
//============================middleware====================================//
app.use(bodyPaser.urlencoded({extended:true}));
app.use(session({
    cookieName:'session',
    secret:'dfdgfhukyujyhgrfsayeughli',
    duration:30*60*1000,
    activaDuration:5*60*1000,
    httpOnly:true ,// don't let javascript access cookie ever
    secure:true,// only https can use cookie
    ephemeral:true
}))
app.use(function(req,res,next){
    if(req.session && req.session.user){
        User.findOne({email:req.session.user.email}, function(err,user){
            if(user){
                console.log("session_middleware")
                req.user = user;
                delete req.user.password;
                req.session.user = req.user;
                res.locals.user = req.user ;
            }
            next();
        })
    }else{
        next();
    }
})
function requireLogin(req,res,next){
    console.log('requireLogin');
    if(!req.user){
        res.redirect('/login');
    }else{
        next();
    }
}
app.use(csurf())
app.use(express.static(path.join(__dirname, 'public')));
//============================middleware====================================//



app.locals.pretty = true;

app.get('/',function(req,res){
    res.render('index', {title:'express'});
})
app.get('/register',function(req,res){
    //res.json(req.body)
    console.log('register')
    res.render('register', {csrfToken:req.csrfToken()});
})
app.post('/register',function(req,res){
    //res.json(req.body)
    var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

    var user = new User({
        firstname:req.body.firstName,
        lastname:req.body.lastName,
        email:req.body.email,
        password:hash
    })
    console.log(user)
    user.save(function(err){
        if(err){
            var err ="Something bad happened ! Try again !";
            if(err.code === 11000){
                err='That email is already taken, try again!'
            }
            res.render('register',{error:err})
        }else{
            res.redirect("/dashboard");
        }

    })
})
app.get('/login',function(req,res){

    res.render('login', {title:'login', csrfToken:req.csrfToken()});
})
app.post('/login',function(req,res){
    User.findOne({email:req.body.email},function(err, user){
        if (!user) {
            console.log("wrong1")
            res.render('login.jade', { error: "Incorrect email / password." });
        } else {
            if (bcrypt.compareSync(req.body.password,user.password)) {
                console.log("correct")
                req.session.user = user; // set-cookie :session = all account thing
                res.redirect('/dashboard');
            } else {
                console.log("wrong2")
                res.render('login.jade', { error: "Incorrect email / password." });
            }
        }
    });
});

app.get('/dashboard',requireLogin,function(req,res){
    res.render('dashboard');
})
app.get('/logout',function(req,res){
    req.session.reset();
    res.redirect('/');
})

app.listen(port,function(){
    console.log("listen port @" +port)
});
