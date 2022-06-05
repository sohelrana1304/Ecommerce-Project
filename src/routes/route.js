const express = require('express');
const router = express.Router();
const middleware = require('../middleware/authorization')
const productController = require('../controller/productController')
const userController = require('../controller/userController');
const cartController = require('../controller/cartController');
const orderController = require('../controller/orderController')


// FEATURE I - User
router.post('/register', userController.createUser) 

router.post('/login', userController.loginUser)

router.get('/user/:userId/profile', middleware.authentication, userController.getUserById)

router.put('/user/:userId/profile', middleware.authentication, userController.updateUser)


// FEATTURE II - Product
router.post('/products', productController.createProduct)

router.get('/products', productController.getProductByQuery)

router.get('/products/:productId', productController.getProductbyId)

router.delete("/products/:productId", productController.deletedProduct)

router.put('/products/:productId', productController.updateProduct)


// FEATURE III - Cart
router.post("/users/:userId/cart", middleware.authentication, cartController.createCart)

router.get("/users/:userId/cart", middleware.authentication, cartController.getCartData)

router.delete("/users/:userId/cart", middleware.authentication, cartController.deleteCartProducts)

router.put("/users/:userId/cart", middleware.authentication, cartController.updateCart)



// FEATURE IV - Order
router.post("/users/:userId/orders", middleware.authentication, orderController.createOrder)

router.put("/users/:userId/orders", middleware.authentication, orderController.updateOrder)




module.exports = router