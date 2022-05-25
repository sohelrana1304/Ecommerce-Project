const productModel = require('../models/productModel')
const validation = require('../validations/validation')
const aws = require('./aws')


const createProduct = async function (req, res) {

    try {

        let data = req.body

        if (!validation.isValidRequestBody(data)) return res.status(400).send({ status: false, msg: "please provoide the data" })

        let { title, description, price, currencyId, currencyFormat, style, availableSizes, installments } = data

        if (!validation.isValid(title)) return res.status(400).send({ status: false, msg: "title or title feild is requried" })
        let uniquetitle = await productModel.findOne({ title: title });
        if (uniquetitle) return res.status(400).send({ status: false, msg: `${title} with this title already exist` })

        if (!validation.isValid(description)) return res.status(400).send({ status: false, msg: "Description or Description feild is requried" })

        if (!validation.isValid(price)) return res.status(400).send({ status: false, msg: "Price or Price feild is requried" })

        if (price <= 0) return res.status(400).send({ status: false, msg: "Price have to be more than Rupees O [Zero]" })

        if (currencyId != "INR") return res.status(400).send({ status: false, msg: "CurrencyId should be only in INR" })

        if (currencyFormat != "₹") return res.status(400).send({ status: false, msg: "Currency Format should be only ₹" })

        if (style) {
            if (!validation.isValid(style)) return res.status(400).send({ status: false, msg: "Style feild is requried" })
        }

        if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) == -1)
            return res.status(400).send({ status: false, message: "Available sizes should be - S, XS, M, X, L, XXL, XL" })

        if (installments) {
            let onlyNumber = /^[0-9]{1,}$/
            if (!(onlyNumber.test(installments))) return res.status(400).send({ status: false, message: "Installments should be in number format" })
        }

        let files = req.files
        if (files && files.length == 0) {
            return res.status(400).send({ msg: "No file found" })
        }
        let uploadedFileURL = await aws.uploadFile(files[0])

        data.productImage = uploadedFileURL

        const createProduct = await productModel.create(data)

        return res.status(400).send({status:true, msg: "Product created successfully", data:createProduct})

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

module.exports.createProduct = createProduct


