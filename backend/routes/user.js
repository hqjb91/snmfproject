const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const nodemailer = require('nodemailer');

module.exports = (pool) => {

const { mkQuery, mkAuth, mkTransaction, verifyJWT } = require('../utils/db');

const SQL_GET_USER_INFO = 'select user_id, email, security from users where user_id like ?';
const SQL_VERIFY_USER_INFO = 'select user_id, email, security from users where user_id like ? and password like sha2(?, 256)';
const SQL_INSERT_USER = 'insert into users (user_id, email, password, security) values (?, ?, sha2(?,256), ?)'; //use transactions
const SQL_INSERT_CHAR_INFO = 'insert into char_info (user_id, user_xp, posX, posY) values (?, ?, ?, ?)';
const SQL_GET_CHAR_INFO = 'select user_id, user_xp, posX, posY from char_info where user_id like ?';
const SQL_UPDATE_FORGET_TOKEN = 'update users set reset_token = ?, reset_expires = ? where user_id like ?';
const SQL_RESET_PASSWORD_WITH_TOKEN = 'update users set password = sha2(?,256) where reset_token = ? and reset_expires > ?';
const SQL_GET_TOP_USERS = 'select user_id, user_xp from char_info order by user_xp desc limit 5';
// const SQL_INSERT_ITEM_LIST = 'insert into item_list (item_id, item_lvl, item_name) values (?, ?, ?)';
// const SQL_INSERT_INVENTORY = 'insert into inventory (user_id, item_id, qty) values (?, ?, ?)';

const verifyUserInfo = mkQuery(SQL_VERIFY_USER_INFO, pool);
const getUserInfo = mkQuery(SQL_GET_USER_INFO, pool);
const registerUserTransaction 
        = mkTransaction([SQL_INSERT_USER, SQL_INSERT_CHAR_INFO], pool);
const getCharInfo = mkQuery(SQL_GET_CHAR_INFO, pool);
const updateForgetToken = mkQuery(SQL_UPDATE_FORGET_TOKEN, pool);
const resetPasswordToken = mkQuery(SQL_RESET_PASSWORD_WITH_TOKEN, pool);
const getTopUsers = mkQuery(SQL_GET_TOP_USERS, pool);

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
    }, (user, password, done) => {

    verifyUserInfo([user, password]).then( response => {
        if(response.length == 1){
            const {user_id, email, security} = response[0];
            done(null, {user_id, email, security});
            return;
        }
        done("Incorrect username and password", false);
    }).catch(e => {
        done(e, false);
    });
}));

const localStrategyAuth = mkAuth(passport);

router.use(passport.initialize());

router.post('/register', async(req, res) => {

    // Get post data from request body
    const {username, password, email} = req.body;

    try {
        // Check if user exists
        const checkUserResponse = await getUserInfo([username]);

        if(checkUserResponse.length > 0) {
            throw new Error('User already registered');
        }
        // Register user
        const registerResponse = await registerUserTransaction([[username, email, password, 0],[username, 0, 30, 30]]);
        res.status(201).json({message:'User Created', registerResponse});

    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.post('/login', localStrategyAuth, (req, res) => {

    currTime = (new Date()).getTime()/1000;

    const {user_id, email, security} = req.user;

    try {
        const token = jwt.sign({
            sub: user_id,
            iss: 'reku',
            iat: currTime,
            exp: currTime + (24 * 60 * 60 * 7), //expires in a week
            data: {
                user_id, email, security
            }
        }, process.env.TOKEN_SECRET);
    
        res.status(200).json({ message: `Login at ${new Date()}`, token});
    } catch (e) {
        console.error(e);
        res.status(500).json({success:false});
    }
});

// Used to verify client side to auto-login if already verified
router.get('/verifyjwt', verifyJWT(jwt), (req, res) => {

    res.status(200).json({ success: true });
});

router.post('/forgetpassword', async (req, res) => {

    try {
        const tokenBuffer = crypto.randomBytes(20);
        const token = tokenBuffer.toString('hex');
    
        // Get post data from request body
        const {username} = req.body;
    
        // Check if user exists
        const checkUserResponse = await getUserInfo([username]);
    
        if(checkUserResponse.length > 0) {
    
            // Get email value
            const email = checkUserResponse[0].email;
    
            // Update the forget password token and expiry
            const currTime = Date.now() + 1000*60*60;
            await updateForgetToken([token, currTime, username]);
    
            const smtpTransport = nodemailer.createTransport({
                // service: 'SendGrid',
                // port: 25,
                // host: "smtp.sendgrid.net",
                // auth: {
                //   user: process.env.SENDGRID_USERNAME,
                //   pass: process.env.SENDGRID_API_KEY
                // }
                service: 'gmail',
                auth: {
                    user: "rekucoin91@gmail.com",
                    pass: process.env.GMAIL_PWD
                }
              });
    
              const mailOptions = {  
                to: email,  
                from: 'hqjb@hotmail.sg',  
                subject: 'Reku Password Reset',  
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +  
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +  
                    // 'http://' + req.headers.host + '/#/reset/' + token + '\n\n' +  
                    'http://' + "localhost:4200" + '/#/reset/' + token + '\n\n' +  
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'  
                };
                smtpTransport.sendMail(mailOptions, err => {                 
                    res.json({status : 'success', message : 'An e-mail has been sent to ' + email + ' with further instructions.'});              
                });
        } else {
            throw new Error('User does not exist in the database');
        }
    } catch (e) {
        console.error(e);
        res.status(400).json({success:false, error:e.message});
    }
});

router.post('/reset/:token', async (req, res) => {
    const {password} = req.body;
    const {token} = req.params;
    const currTime = Date.now();

    try {
        await resetPasswordToken([password, token, currTime]);
        res.status(204).json({success:true});
    } catch (e) {
        console.error(e);
        res.status(400).json({success:false});
    }
});

router.get('/topusers', async (req, res) => {
    try {
        const resp = await getTopUsers([]);
        res.status(200).json({success:true, data: resp});
    } catch (e) {
        console.error(e);
        res.status(400).json({success:false});
    }
});

return router;
}