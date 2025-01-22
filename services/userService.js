//userService.js
const sharp= require('sharp');
const { v4: uuidv4 } = require('uuid');         //creates a random id
const bcrypt= require('bcrypt');
const asyncHandler= require('express-async-handler');
const UserModel= require('../models/userModel');
const factory= require('./handlersFactory');
const {uploadSingleImage}= require('../middlewares/uploadimageMiddleware');
const ApiError= require('../utils/ApiError');
const createToken = require('../utils/createToken');

//upload single image
exports.uploadUserImage= uploadSingleImage('profileImage');  

//Image processing
exports.resizeImage= asyncHandler( async(req,res,next)=>{
    const fileName= `user-${uuidv4()}-${Date.now()}.jpeg`;
    if(req.file&& req.file.buffer)
    {
        await sharp(req.file.buffer)
        .resize(400,400)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`uploads/users/${fileName}`);
        req.body.profileImage= fileName; // save image to data base (req.body is passed to the Model.create in the createOne function)
    }
    
    next();
});

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private
exports.getUsers= factory.getAll(UserModel);

// @desc    Get list of users
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser= factory.getOne(UserModel);

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private
exports.createUser= factory.createOne(UserModel);

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
//updates all user fields except the password
exports.updateUser= asyncHandler(async (req,res,next)=>{
    const document= await UserModel.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            slug: req.body.slug,
            phone: req.body.phone,
            email: req.body.email,
            profileImg: req.body.profileImg,
            role: req.body.role
        },
        {new:true}  // return the updated document not the old one
    );
    if(!document){
        return next(new ApiError(`No document found for this id ${req.params.id}`,400)) ;
    }
    res.status(200).json({data: document});
});

// @desc    Update user
// @route   PUT /api/v1/users/changePassword/:id
// @access  Private/Admin   //?
exports.changePassword= asyncHandler(async (req,res,next)=>{

    const document= await UserModel.findByIdAndUpdate(
        req.params.id,
        {
            password: await bcrypt.hash(req.body.password,12),
            passwordChangedAt: Date.now()
        },
        {new:true}  // return the updated document not the old one
    );
    if(!document){
        return next(new ApiError(`No document found for this id ${req.params.id}`,400)) ;
    }
    res.status(200).json({data: document});
});


// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser= factory.deleteOne(UserModel);

// @desc    Get logged user data
// @route   DELETE /api/v1/users/getMe
// @access  Private/Protect (only the loggedIn user)
exports.getLoggedUser= (req,res,next)=>{    //?
    req.params.id= req.user._id;
    next();
};

// @desc    Update logged user password
// @route   PUT /api/v1/users/changeMyPassword
// @access  Private/Protect (only the loggedIn user) //?
exports.changeLoggedUserPssword= asyncHandler(async(req,res,next)=>{
     // 1) Update user password based user payload (req.user._id)
    const user= await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
    {
        new:true
    })
// 2) Generate token
    const token= createToken(user._id);
    res.status(200).json({data:user, token});
});


// @desc    Update logged user data (without password or role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect (only the loggedIn user) //?
exports.updateMe= asyncHandler( async(req,res,next)=>{
    const newUser= await UserModel.findByIdAndUpdate(
        req.user._id,
        {
            phone: req.body.phone,
            name: req.body.name,
            email: req.body.email
        },
        {
            new:true
        }
    )
    console.log("updateMe");
    
    res.status(200).json({updatedUser: newUser});
});


// @desc    delete logged user
// @route   PUT /api/v1/users/deleteMe
// @access  Private/Protect (only the loggedIn user) //?
exports.deleteMe= asyncHandler( async(req,res,next)=>{  
    await UserModel.findByIdAndUpdate(req.user._id,{active: false});
    res.status(204).json({status: "sccess"});
});



//notices
// req.user --> user has been added to the req in the protect middleware(when we made sure
// that the user is loggned in)

//  getMe=> the purpose of getMe middleware is to add the id of the logged user to the 
//  req.parameter in order to use it in the getUser middleware

/* changePassword=> 
    Purpose: Allows an administrator or an authorized user to update the password for any user, identified by req.params.id.
    Example Usage: Admin changing the password of a user with ID 123.

*/
/*
    changeLoggedUserPssword=>
    Purpose: Allows the logged-in user to update their own password.
    Usage: This function is for the user who is logged in and authenticated.
    It relies on req.user._id, which typically comes from the protect middleware that precede
    the changeLoggedUserPssword function in the userRoutes file.
*/



















