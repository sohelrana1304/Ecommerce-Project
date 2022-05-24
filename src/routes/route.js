const express = require('express');
const router = express.Router();
const middleware = require('../middleware/authorization')

const userController=require('../controller/userController');


router.post('/register',userController.createUser) 

router.post('/login', userController.loginUser)

router.get('/user/:userId/profile', middleware.authorizatoion ,userController.getUserList)

router.put('/user/:userId/profile', middleware.authorizatoion ,userController.updateUserList)


module.exports = router