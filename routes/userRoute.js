//userRoutes.js
const express= require('express');
const {
    getUserValidator,
    createUserValidator,
    updateUserValidator,
    deleteUserValidator,
    changePasswordValidator,
    updateLoggedUserValidator
    }= require('../utils/validators/userValidator');

const {
      getUsers,
      createUser,
      getUser,
      updateUser,
      deleteUser,
      changePassword,
      uploadUserImage,
      resizeImage,
      getLoggedUser,
      changeLoggedUserPssword,
      updateMe,
      deleteMe
    } = require('../services/userService');

const {protect, allowedTo}= require('../services/authService');

const router= express.Router(); 

router.use(protect);    //protect middleware will work for all routes comming after it.

//User
router.route('/getMe')
    .get( getLoggedUser, getUser);    
router.route('/changeMyPassword')
    .put(changeLoggedUserPssword);    
router.route("/updateMe")
    .put(updateLoggedUserValidator,updateMe)
router.route("/deleteMe")
    .delete(deleteMe)

router.use(allowedTo('admin','manager'));  //allowed middleware will work for all routes comming after it.


//Admin
router.route('/')               
    .get( getUsers)
    .post(
        uploadUserImage, 
        resizeImage, 
        createUserValidator, 
        createUser)


router.route('/:id')
    .get(getUserValidator, getUser)
    .put(
        uploadUserImage,
        resizeImage,
        updateUserValidator, 
        updateUser)
    .delete(
        deleteUserValidator
        ,deleteUser)
router.route('/changePassword/:id')
    .put(changePasswordValidator, changePassword)



module.exports= router;


//notices
/*
.put(protect, getLoggedUser, getUser)  ==> pretect will add req.user because we will need user in the getMe function.

*/

