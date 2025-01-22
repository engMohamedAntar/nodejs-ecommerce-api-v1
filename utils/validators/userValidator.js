//userValidator.js
const slugify= require('slugify');
const bcrypt= require('bcrypt');
const { check, body } = require('express-validator');
const validatorMiddleware= require('../../middlewares/validatorMiddleware');
const UserModel= require('../../models/userModel');


exports.createUserValidator= [
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
        if(req.body.confirmationPassword !== val)
            throw new Error('Password does not match with confirmationPassword');
        return true;
    }),
    check('confirmationPassword')
    .notEmpty().withMessage('confirmation Password required'),

    check('profileImage')
    .optional(),

    check('role')
    .optional(),

    check('phone')
    .optional()
    .isMobilePhone(["ar-EG","ar-SA"]).withMessage('invalid phone number only accept EG and SA phones'),

    check('active')
    .optional(),

    validatorMiddleware
];

exports.getUserValidator= [
    check('id').isMongoId().withMessage("Invalid User id format"),
    validatorMiddleware
]

exports.updateUserValidator= [
    check('id').isMongoId().withMessage("Invalid User id format"),
    body('name')
    .optional()                         //name may not be updated
    .custom((val,{req})=>{
        req.body.slug= slugify(val);
        return true;
    }),
    check('email')
    .optional()
    .isEmail().withMessage('invalid email')
    .custom(async(val,{req})=>
        await UserModel.findOne({email:val}).then((email)=>{
        if(email)
            Promise.reject(new Error('This email exist before'));
        })
    ),
    check('phone')
    .optional()
    .isMobilePhone(["ar-EG","ar-SA"])
    .withMessage('invalid phone number only accept EG and SA phones'),
        
       
    validatorMiddleware
];
exports.updateLoggedUserValidator= [  
    body('name')
    .optional()                         //name may not be updated
    .custom((val,{req})=>{
        req.body.slug= slugify(val);
        return true;
    }),
    check('email')
    .optional()
    .isEmail().withMessage('invalid email')
    .custom((val,{req})=>
        UserModel.findOne({email:val}).then((email)=>{
        if(email)
            Promise.reject(new Error('This email exist before'));
        })
    ),
    check('phone')
    .optional()
    .isMobilePhone(["ar-EG","ar-SA"])
    .withMessage('invalid phone number only accept EG and SA phones'),
    
    
    validatorMiddleware
];



exports.deleteUserValidator= [
    check('id').isMongoId().withMessage("Invalid User id format"),
    validatorMiddleware
];

exports.changePasswordValidator= [
    check('id')
    .isMongoId().withMessage('user id not valid'),

    check('currentPassword')
    .notEmpty().withMessage('current password is required'),

    check('passwordConfirm')
    .notEmpty().withMessage('password confirm is required'),

    check('password')
    .notEmpty().withMessage('new password is required')
    .custom(async(val, {req})=>{
        //validate that currentPassword = UserModel.findById(req.query.id)
        const user= await UserModel.findById(req.params.id);
        if(!user)
            throw new Error('no user found for this id');
        const mached=await bcrypt.compare(req.body.currentPassword , user.password);
        if(!mached)
            throw new Error('current password not correct');

        //validate that password = passwordConfirm
        if(val !== req.body.passwordConfirm)
            throw new Error('password doesn\'t match password confirm')
        return true;
    }),
    validatorMiddleware
]
