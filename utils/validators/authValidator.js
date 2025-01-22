//userValidator.js
const slugify= require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware= require('../../middlewares/validatorMiddleware');
const UserModel= require('../../models/userModel');


exports.signUpValidator= [
    check('name')
    .notEmpty().withMessage('name required')
    .isLength({min:3}).withMessage('very short name')
    .isLength({max:20}).withMessage('very long name')
    .custom((val,{req})=>{
        req.body.slug=slugify(val);
        return true;
    }),

    check('email')
    .notEmpty().withMessage('email required')
    .isEmail().withMessage('invalid email address')
    .custom((val)=> UserModel.findOne({email: val}).then((email)=>{         // ensure that email is unique
        if(email)
            return Promise.reject(new Error('this email eixt before'));
    })),

    
    check('password')
    .notEmpty().withMessage('password required')
    .isLength({min:6}).withMessage('password must be at least 6 characters')
    .custom((val,{req})=>{
        if(req.body.passwordConfirm !== val)
            throw new Error('Password does not match with passwordConfirm');
        return true;
    }),
    check('passwordConfirm')
    .notEmpty().withMessage('passwordConfirm required'),

    validatorMiddleware
];

exports.logInValidator= [
    check('email')
    .notEmpty().withMessage('email required')
    .isEmail().withMessage('invalid email address'),

    check('password')
    .notEmpty().withMessage('password required')
    .isLength({min:6}).withMessage('password must be at least 6 characters'),
    validatorMiddleware
];
