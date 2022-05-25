const productModel = require('../models/productModel')
const validation = require('../validations/validation')
const aws = require('./aws')


const createProduct = async function (req, res) {
    
    try{

        let data = req.body

        if(!validation.isValidRequestBody) return res.status(400).send({status: false, msg:"please provoide the data"})

        let {title, description, price, currencyId, currencyFormat, style, availableSizes, installments} = data

        if(!validation.isValid(title)) return res.status(400).send({status:false, msg:"title or title feild is requried"})
        let uniquetitle = await productModel.findOne({title: title});
        if(uniquetitle) return res.status(400).send({status:false, msg:`${title} with this title already exist`})


    }
    catch(err){
        return res.status(500).send({status:false, msg: err.message})
    }


}


