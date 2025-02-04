//authRoute.js
const express= require('express');
const {signUpValidator, logInValidator}= require('../utils/validators/authValidator');

const {signUp, logIn, forgotPassword, verifyPassResetCode, resetPassword}= require('../services/authService');
const csrfProtection= require('../middlewares/csrfMiddleware');
const router= express.Router(); 


router.route('/signUp')               
    .post(signUpValidator ,signUp)
router.route('/logIn')               
    .post(logInValidator ,logIn) 
router.route('/forgotPassword')
    .post(forgotPassword)
router.route('/verifyResetCode')
    .post(verifyPassResetCode)
router.route('/resetPassword')
    .put(csrfProtection ,resetPassword)

module.exports= router;

