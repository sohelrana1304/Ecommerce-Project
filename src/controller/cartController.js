const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const validation = require('../validations/validation')


const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body

        const {cartId, productId} = data

        if (!validation.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "UserId is not valid" })
        
        let checkUserId = await userModel.findById({_id: userId})
        if(!checkUserId) return res.status(400).send({ status: false, message: "User does't exist" })

        if (!validation.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "ProductId is not valid" })

        let checkProductId = await productModel.findOne({_id: productId, isDeleted: false})
        if(checkProductId == null) return res.status(400).send({ status: false, message: "Product does't exist" })

        if (cartId) {
            if (!validation.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "CartId is not valid" })

            let checkCartId = await cartModel.findById({_id: cartId})
            if(!checkCartId) return res.status(400).send({ status: false, message: "CartId does't exist" })
        }

        



    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.createCart = createCart