const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")
const validation = require("../validations/validation")
const jwt = require("jsonwebtoken")
const aws = require("./aws")
//const { json } = require("express/lib/response")

const createUser = async function (req, res) {
    try {
        let data = req.body;
        let { fname, lname, email, password, phone, address } = data
        let files = req.files

        if (!validation.isValidRequestBody(data)) return res.status(400).send({ status: false, msg: "please provide  details" })

        if (!validation.isValid(fname)) return res.status(400).send({ status: false, message: "first name is required or not valid" })

        if (!validation.isValid(lname)) return res.status(400).send({ status: false, message: "last name is required or not valid" })




        if (!validation.isValid(email)) return res.status(400).send({ status: false, message: "email is required or not valid" })

        if (!validation.isValidEmail(email)) return res.status(400).send({ status: false, message: "email is not valid" })

        let checkEmail = await userModel.findOne({ email: email })

        if (checkEmail) return res.status(409).send({ status: false, msg: "email already exist" })




        if (!validation.isValid(password)) return res.status(400).send({ status: false, message: "password is required or not valid" })

        if (validation.isValidPassword(password)) return res.status(400).send({ status: false, message: "Password length should be 8 to 15 digits and enter atleast one uppercase or lowercase" })



        if (!validation.isValid(phone)) return res.status(400).send({ status: false, message: "phone is required or not valid" })

        if (!validation.isValidNumber(phone)) return res.status(400).send({ status: false, message: "phone number is not valid" })

        let checkPhone = await userModel.findOne({ phone: phone })

        if (checkPhone) return res.status(409).send({ status: false, msg: "Phone already exist" })



        let addresss = JSON.parse(address)

        if (!validation.isValid(addresss.shipping.street)) return res.status(400).send({ status: false, message: "street field is required or not valid" })

        if (!validation.isValid(addresss.shipping.city)) return res.status(400).send({ status: false, message: "city field is required or not valid" })

        if (!validation.isValid(addresss.shipping.pincode)) return res.status(400).send({ status: false, message: "pincode field is required or not valid" })

        if (!validation.isValidPincode(addresss.shipping.pincode)) return res.status(400).send({ status: false, message: "PIN code should contain 6 digits only " })




        if (!validation.isValid(addresss.billing.street)) return res.status(400).send({ status: false, message: "street field is required or not valid" })

        if (!validation.isValid(addresss.billing.city)) return res.status(400).send({ status: false, message: "city field is required or not valid" })

        if (!validation.isValid(addresss.billing.pincode)) return res.status(400).send({ status: false, message: "pincode field is required or not valid" })

        if (!validation.isValidPincode(addresss.billing.pincode)) return res.status(400).send({ status: false, message: "PIN code should contain 6 digits only " })




        if (files && files.length == 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman

            res.status(404).send({ msg: "No file found" })
        }
        let uploadedFileURL = await aws.uploadFile(files[0])

        data.profileImage = uploadedFileURL

        const saltRounds = 10
        const hash = bcrypt.hashSync(password, saltRounds)
        data.password = hash

        data.address = addresss
        let createUser = await userModel.create(data)
        return res.status(201).send({ status: true, message: "user created successfully", createUser })

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}

module.exports.createUser = createUs