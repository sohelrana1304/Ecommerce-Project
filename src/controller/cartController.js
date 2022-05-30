const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const validation = require('../validations/validation')


const createCart = async function (req, res) {
    try {
        let data = req.body;
        if (Object.keys(data) == 0) { return res.status(400).send({ status: false, message: "Please provide input " }) }

        let cId = data.cartId;
        let pId = data.productId;
        let uId = req.params.userId;

         // Authentication
         let tokenId = req.userId
         // console.log(tokenId)
         if (tokenId != uId) return res.status(401).send({ status: false, message: "Unauthorised Access" })

        if (!cId) {
            let cartExistforUser = await cartModel.findOne({ userId: uId })
            if (cartExistforUser) {
                return res.status(400).send({ status: false, message: "Cart already exist for this user. PLease provide cart Id or delete the existing cart" })
            }
        }

        if (cId) {
            let findCart = await cartModel.findById({ _id: cId })
            if (!findCart)
                return res.status(400).send({ status: false, message: `No cart with this Id - ${cId}` })
        }

        if (!pId) { return res.status(400).send({ status: false, message: "Please provide Product Id " }) }

        if (!pId) { return res.status(400).send({ status: false, message: "Please provide Product Id " }) }


        //if (Object.keys(uId) == 0) { return res.status(400).send({ status: false, message: "Please provide User Id " }) }

        let userExist = await userModel.findOne({ _id: uId });
        if (!userExist) {
            return res.status(404).send({ status: false, message: `No user found with this ${uId}` })
        }


        let cartExist = await cartModel.findOne({ _id: cId });
      


        if (cartExist) {
            
            if (cartExist.userId != uId) {
                return res.status(403).send({ status: false, message: "This cart does not belong to you. Please check the cart Id" })
            }
            let updateData = {}

            if (cartExist.items.length == 0) {
                let arr = []

                const object = { productId: pId, quantity: 1 }
                arr.push(object)
                updateData["items"] = arr;

                const productPrice = await productModel.findOne({ _id: pId, isDeleted: false }).select({ price: 1, _id: 0 })

                if (!productPrice) { return res.status(404).send({ status: false, mesaage: `No product found with this ${pId}` }) }

                nPrice = productPrice.price;
                updateData['totalPrice'] = cartExist.totalPrice + (nPrice * 1)
                updateData['totalItems'] = arr.length

                const updatedCart = await cartModel.findOneAndUpdate({ _id: cId }, updateData, { new: true })
                return res.status(200).send({ status: true, message: "Updated Cart", data: updatedCart })
            }

            for (let i = 0; i < cartExist.items.length; i++) {
                if (cartExist.items[i].productId == pId) {
                    // console.log(i)
                    cartExist.items[i].quantity = cartExist.items[i].quantity + 1;

                    updateData['items'] = cartExist.items
                    const productPrice = await productModel.findOne({ _id: pId, isDeleted: false }).select({ price: 1, _id: 0 })
                    if (!productPrice) { return res.status(404).send({ status: false, mesaage: `No product found with this ${pId}` }) }
                    nPrice = productPrice.price;
                    updateData['totalPrice'] = cartExist.totalPrice + (nPrice * 1)
                    updateData['totalItems'] = cartExist.items.length;

                    const updatedCart = await cartModel.findOneAndUpdate({ _id: cId }, updateData, { new: true })
                    return res.status(200).send({ status: true, message: "Updated Cart", data: updatedCart })
                }
            }
            for (let j = 0; j < cartExist.items.length; j++) {

                if (cartExist.items[j].productId != pId) {
                  
                    const obj = { productId: pId, quantity: 1 }
                    let arr = cartExist.items
                    arr.push(obj)
                    updateData['items'] = arr

                    const productPrice = await productModel.findOne({ _id: pId, isDeleted: false }).select({ price: 1, _id: 0 })
                    if (!productPrice) { return res.status(404).send({ status: false, mesaage: `No product found with this ${pId}` }) }
                    nPrice = productPrice.price
                    updateData['totalPrice'] = cartExist.totalPrice + (nPrice * 1)
                    updateData['totalItems'] = cartExist.items.length;

                    const updatedCart = await cartModel.findOneAndUpdate({ _id: cId }, updateData, { new: true })
                    return res.status(200).send({ status: true, message: "Updated Cart", data: updatedCart })
                }
            }
        }


        else {
            let newData = {}
            let arr = []
            newData.userId = uId;

            const object = { productId: pId, quantity: 1 }
            arr.push(object)
            newData.items = arr;

            const productPrice = await productModel.findOne({ _id: pId, isDeleted: false }).select({ price: 1, _id: 0 })
            if (!productPrice) { return res.status(404).send({ status: false, mesaage: `No product found with this ${pId}` }) }

            nPrice = productPrice.price;
            newData.totalPrice = nPrice;

            newData.totalItems = arr.length;

            const newCart = await cartModel.create(newData)

            return res.status(201).send({ status: true, message: "Cart details", data: newCart })


        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


const getCartData = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!validation.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "User Id is not valid" })

        let findUser = await userModel.findById({ _id: userId })
        if (!findUser) return res.status(404).send({ status: false, message: "User not found" })

        // Authentication
        let tokenId = req.userId
        // console.log(tokenId)
        if (tokenId != userId) return res.status(401).send({ status: false, message: "Unauthorised Access" })

        let findCart = await cartModel.findOne({ userId: userId })
        // console.log(findCart)
        if (!findCart) return res.status(404).send({ status: false, message: "Cart is not found" })

        return res.status(200).send({ status: true, message: "Cart data fetched successfully", data: findCart })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const deleteCartProducts = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!validation.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "User Id is not valid" })

        let findUser = await userModel.findById({ _id: userId })
        if (!findUser) return res.status(404).send({ status: false, message: "User not found" })

        // Authentication
        let tokenId = req.userId
        // console.log(tokenId)
        if (tokenId != userId) return res.status(401).send({ status: false, message: "Unauthorised Access" })

        let findCart = await cartModel.findOne({ userId: userId })
        // console.log(findCart)
        if (findCart === null) return res.status(404).send({ status: false, message: "Cart is not found" })

        

        let updateCartData = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })

        return res.status(204).send({status: true, message: "Cart data cleared successfully", data: updateCartData})

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


const updateCart = async function (req, res) {
    try {
        let userId = req.params.userId
        // const idFromToken = req.userId
        if (!validation.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "userId is not a valid objectId" })
        }

        let data = req.body
        const { cartId, productId, removeProduct } = data

        if (!validation.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "Enter value to be updating.." })
        }
        if (!validation.isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is required" })
        }
        if (!validation.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is not a valid objectId" })
        }
        if (!validation.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId is required" })
        }
        if (!validation.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is not a valid objectId" })
        }
        if (!(removeProduct == 0 || removeProduct == 1)) {
            return res.status(400).send({ status: false, msg: "removeProduct value should be either 0 or 1" })
        }

        const userDetails = await userModel.findOne({ _id: userId })
        if (!userDetails) {
            return res.status(404).send({ status: false, msg: "user not exist with this userId" })
        }
        const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productDetails) {
            return res.status(404).send({ status: false, msg: "product not exist or deleted" })
        }
        const cartDetails = await cartModel.findOne({ _id: cartId })
        if (!cartDetails) {
            return res.status(400).send({ status: false, msg: "cart is not added for this cardId, create cart first" })
        }

        if (removeProduct == 1) {
            for (let i = 0; i < cartDetails.items.length; i++) {
                if (cartDetails.items[i].productId == productId) {
                    let newPrice = cartDetails.totalPrice - productDetails.price
                    if (cartDetails.items[i].quantity > 1) {
                        cartDetails.items[i].quantity -= 1
                        let updateCartDetails = await cartModel.findOneAndUpdate({ _id: cartId }, { items: cartDetails.items, totalPrice: newPrice }, { new: true })
                        return res.status(200).send({ status: true, msg: "cart updated successfully", data: updateCartDetails })
                    }
                    else {
                        totalItem = cartDetails.totalItems - 1
                        cartDetails.items.splice(i, 1)

                        let updatedDetails = await cartModel.findOneAndUpdate({ _id: cartId }, { items: cartDetails.items, totalPrice: newPrice, totalItems: totalItem }, { new: true })
                        return res.status(200).send({ status: true, msg: "cart removed successfully", data: updatedDetails })
                    }
                }
            }
        }

        if (removeProduct == 0) {
            for (let i = 0; i < cartDetails.items.length; i++) {
                if (cartDetails.items[i].productId == productId) {
                    let newPrice = cartDetails.totalPrice - (productDetails.price * cartDetails.items[i].quantity)
                    let totalItem = cartDetails.totalItems - 1
                    cartDetails.items.splice(i, 1)
                    let updatedCartDetails = await cartModel.findOneAndUpdate({ _id: cartId }, { items: cartDetails.items, totalItems: totalItem, totalPrice: newPrice }, { new: true })
                    return res.status(200).send({ status: true, msg: "item removed successfully", data: updatedCartDetails })
                }
            }
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.createCart = createCart
module.exports.getCartData = getCartData
module.exports.deleteCartProducts = deleteCartProducts
module.exports.updateCart = updateCart