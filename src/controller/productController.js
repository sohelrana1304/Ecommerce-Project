const productModel = require('../models/productModel')
const validation = require('../validations/validation')
const aws = require('./aws')


const createProduct = async function (req, res) {

    try {

        let body = req.body

        if (!validation.isValidRequestBody(body)) return res.status(400).send({ status: false, msg: "please provoide the body" })

        let { title, description, price, currencyId, currencyFormat, style, isFreeShipping, availableSizes, installments } = body

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

        // if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) == -1)
        //     return res.status(400).send({ status: false, message: "Available sizes should be - S, XS, M, X, L, XXL, XL" })

        if (installments) {
            let onlyNumber = /^[0-9]{1,}$/
            if (!(onlyNumber.test(installments))) return res.status(400).send({ status: false, message: "Installments should be in number format" })
        }

        let files = req.files
        if (files && files.length == 0) {
            return res.status(400).send({ msg: "No file found" })
        }


        let productPicture = await aws.uploadFile(files[0])

        if (isFreeShipping) {

            if (!((isFreeShipping === "true") || (isFreeShipping === "false"))) {
                return res.status(400).send({ status: false, message: 'isFreeShipping should be true or false' })
            }
        }
        let productRegister = { title, description, price, currencyId, currencyFormat, productImage: productPicture, isFreeShipping, style, availableSizes, installments }


        if (availableSizes) {
            let array = availableSizes.split(",").map(x => x.trim()) //this will split the available sizes and give it an array

            for (let i = 0; i < array.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))) {
                    return res.status(400).send({ status: false, msg: `Available sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"].join(',')}` })
                }
            }
            if (Array.isArray(array)) {
                productRegister['availableSizes'] = array
            }
        }

        const createProduct = await productModel.create(productRegister)

        return res.status(201).send({ status: true, msg: "Product created successfully", body: createProduct })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}


const getproduct = async (req, res) => {
    try {
        let filterQuery = req.query;
        let { size, name, priceGreaterThan, priceLessThan, priceSort, isFreeShipping } = filterQuery;

        let query = {}
        query['isDeleted'] = false;

        if (isFreeShipping) {
            if (typeof isFreeShipping !== "boolean") { return res.status(400).send({ status: false, message: "value must be in true or false" }) }
            query['isFreeShipping'] = isFreeShipping
        }

        if (size) {
            let array = size.split(",").map(x => x.trim())
            query['availableSizes'] = array
        }
        if (name) {
            name = name.trim()
            const regexName = new RegExp(name, "i")
            query['title'] = { $regex: regexName }
        }
        if (priceGreaterThan) {
            query['price'] = { $gt: priceGreaterThan }
        }
        if (priceLessThan) {
            query['price'] = { $lt: priceLessThan }
        }
        if (priceGreaterThan && priceLessThan) {
            query['price'] = { '$gt': priceGreaterThan, '$lt': priceLessThan }
        }

        if (priceSort) {
            if (priceSort == -1 || priceSort == 1) {
                query['priceSort'] = priceSort
            } else {
                return res.status(400).send({ status: false, message: "Please provide valid value of priceSort" })
            }
        }

        let getAllProducts = await productModel.find(query).sort({ price: query.priceSort })
        const countproducts = getAllProducts.length
        if (!(countproducts > 0)) {
            return res.status(404).send({ status: false, msg: "No products found" })
        }
        return res.status(200).send({ status: true, message: `${countproducts} Products Found`, body: getAllProducts });

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })

    }
}

const getProductList = async (req, res) => {
    try {
        let productId = req.params.productId
        // console.log(productId)


        if (!validation.isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "productId  is not valid" }) }

        let checkbody = await productModel.findOne({ _id: productId });

        if (!checkbody) return res.status(404).send({ status: false, msg: "There is no product exist with this id" });

        if (checkbody.isDeleted == true) return res.status(404).send({ status: false, msg: "Product is already deleted" });

        return res.status(200).send({ status: true, message: 'Product profile details', body: checkbody });
    }
    catch (err) {
        //console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}

const deletedProduct = async function (req, res) {
    try {

        let productId = req.params.productId

        if (!validation.isValidObjectId(productId)) {
            return res.status(404).send({ status: false, message: "Product id is not valid" })
        }
        let deleteBook = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false },
            { $set: { isDeleted: true, deletedAt: new Date() } })

        if (deleteBook == null) return res.status(404).send({ status: false, message: "Product is already deleted" })

        return res.status(200).send({ status: true, message: "Product has been deleted successfully" })

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}


const updateProduct = async function (req, res) {
    try {
        const body = req.body

        productId = req.params.productId
        if (!validation.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: `${productId} is invalid` })
        }

        const productFound = await productModel.findOne({ _id: productId, isDeleted: false })
        if (productFound == null) {
            return res.status(404).send({ status: false, msg: "product does not exist" })
        }

        // Destructuring
        let { title, description, price, style, isFreeShipping, availableSizes, installments } = body


        let updatedbody = {}


        if (title == "") return res.status(400).send({ status: false, msg: "title not valid" })


        if (title) {
            if (!validation.isValid(title)) {
                return res.status(400).send({ status: false, msg: "not valid title" })
            }
            let Pattern = /^[a-zA-Z0-9 ]*$/;
            if (!(Pattern.test(title))) return res.status(400).send({ status: false, msg: "not a valid format for title" })
            const duplicatTitle = await productModel.findOne({ title: title })
            if (duplicatTitle) {
                return res.status(400).send({ status: false, msg: "title is already exist" })
            }

            updatedbody['title'] = title

        }


        if (description == "") return res.status(400).send({ status: false, msg: "description not valid" })
        if (description) {
            if (!validation.isValid(description)) {
                return resstatus(400).send({ status: false, msg: "not valid description" })
            }
            let Pattern = /^[a-zA-Z ]*$/;
            if (!(Pattern.test(description))) return res.status(400).send({ status: false, msg: "not a valid description" })

            updatedbody['description'] = description
        }


        if (price) {
            if (price == "") return res.status(400).send({ status: false, msg: "price not valid" })

            if (price <= 0) return res.status(400).send({ status: false, msg: "Price have to be more than Rupees O [Zero]" })


            let Pattern = /^[0-9]+\.?[0-9]+$/;
            if (!(Pattern.test(price))) return res.status(400).send({ status: false, msg: "not a valid price" })

            updatedbody['price'] = price
        }


        if (availableSizes) {
            let array = availableSizes.split(",").map(x => x.trim()) //this will split the available sizes and give it an array

            for (let i = 0; i < array.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))) {
                    return res.status(400).send({ status: false, msg: `Available sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"].join(',')}` })
                }
            }
            if (Array.isArray(array)) {
                updatedbody['availableSizes'] = array
            }
        }


        if (isFreeShipping) {
            if (!((isFreeShipping === "true") || (isFreeShipping === "false")))
                return res.status(400).send({ status: false, message: 'isFreeShipping should be true or false' })
            updatedbody['isFreeShipping'] = isFreeShipping
        }
        if (style) {
            if (!validation.isValid(style)) return res.status(400).send({ status: false, msg: "Style feild is requried" })
            updatedbody['style'] = style
        }


        if (installments) {
            let onlyNumber = /^[0-9]{1,}$/
            if (!(onlyNumber.test(installments))) return res.status(400).send({ status: false, message: "Installments should be in number format" })
            updatedbody['installments'] = installments
        }


        let files = req.files;
        // if (files) {
        //     if (files.length == 0) return res.status(400).send({ status: false, msg: "No File to update" })
        // }

        if (files && files.length > 0) {
            console.log(files)

            let uploadedFileURL = await aws.uploadFile(files[0]);
            if (uploadedFileURL) {
                updatedbody['productImage'] = uploadedFileURL
            } else {
                res.status(400).send({ status: false, msg: "File not Found" })
            }
        }

        //check it once.........................................................................................
        console.log(updatedbody)
        if (!validation.isValidRequestBody(updatedbody)) { return res.status(400).send({ status: false, msg: "give some body for update" }) }

        const updated = await productModel.findByIdAndUpdate({ _id: productId }, updatedbody, { new: true })

        return res.status(201).send({ status: true, body: updated })

    } catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}




module.exports.updateProduct = updateProduct
module.exports.createProduct = createProduct
module.exports.getproduct = getproduct
module.exports.getProductList = getProductList
module.exports.deletedProduct = deletedProduct


