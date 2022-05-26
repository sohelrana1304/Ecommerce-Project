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


const getproduct = async (req, res) => {
    try {
        let filterQuery = req.query;
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = filterQuery;
       
            let query = {}
            query['isDeleted'] = false;

            if (size) {
                query['availableSizes'] = size
            }
            if (name) {
                name = name.trim()
                query['title'] = { $regex: name }
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

             let getAllProducts = await productModel.find(query)                         //.sort({ price: query.priceSort })
            const countproducts = getAllProducts.length 
            if (!(countproducts > 0)) {
                return res.status(404).send({ status: false, msg: "No products found" })
            }
            return res.status(200).send({ status: true, message: `${countproducts} Products Found`, data: getAllProducts });
      
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })

    }
}

const getProductList = async (req, res) => {
    try {
        let productId = req.params.productId
        // console.log(userId)
        
    
        if (!validation.isValidObjectId(productId)) 
        {return res.status(400).send({ status: false, message: "productId  is not valid" })}

        let checkData = await productModel.findOne({ _id: productId });
        
        if (!checkData) return res.status(404).send({ status: false, msg: "There is no product exist with this id" });

        if(checkData.isDeleted==true) return res.status(400).send({ status: false, msg: "Product is already deleted" });


        return res.status(200).send({ status: true, message: 'Product profile details', data: checkData });
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








module.exports.createProduct = createProduct
module.exports.getproduct = getproduct
module.exports.getProductList = getProductList
module.exports.deletedProduct = deletedProduct


