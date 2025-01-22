//addressesRoute.js
const express = require('express');
const router = express.Router();
const { protect, allowedTo } = require('../services/authService');
const { addAddress, removeAddress,getLoggedUserAddresses } = require('../services/addressService');
const {addAddressValidator, removeAddressValidator} = require('../utils/validators/addressValidator');

router.use(protect, allowedTo('user'));
router.route('/')
    .post(addAddressValidator, addAddress)// 
    .get( getLoggedUserAddresses)
router.route('/:addressId')
    .delete(removeAddressValidator, removeAddress); 

module.exports = router;
