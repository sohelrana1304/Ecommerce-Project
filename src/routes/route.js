const express = require('express');
const router = express.Router();
const middleware = require('../middleware/authorization')
const productController = require('../controller/productController')
const userController = require('../controller/userController');
const cartController = require('../controller/cartController');


router.post('/register',userController.createUser) 

router.post('/login', userController.loginUser)

router.get('/user/:userId/profile', middleware.authorizatoion ,userController.getUserList)

router.put('/user/:userId/profile', middleware.authorizatoion ,userController.updateUserList)



router.post('/products', productController.createProduct)

router.get('/products', productController.getproduct)

router.get('/products/:productId', productController.getProductList)

router.delete("/products/:productId", productController.deletedProduct)

router.put('/products/:productId' ,productController.updateProduct)



router.post("/users/:userId/cart", cartController.createCart)






module.exports = router