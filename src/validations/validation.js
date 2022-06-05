const mongoose = require('mongoose')

// Validation
const isValid = function (value) {
    if (typeof value === "undefined" || typeof value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

// Indian mobile number validation
const isValidNumber = function (value) {
    const noNumber = /^(\+91[\-\s]?)?[0]?(91)?[6-9]\d{9}$/g
    if (typeof value !== 'string') return false
    if (noNumber.test(value) === false) return false
    return true
}

// Email Id validation
const isValidEmail = function (value) {
    let mailFormat = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    // Checking if the inputted email id perfectely formatted or not
    if (!(value.match(mailFormat))) return false
    return true

}

// req.body validation if it is empty
const isValidRequestBody = function (requestbody) {
    return Object.keys(requestbody).length > 0;
}

// Mongoose ObjectId validation
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

// Pincode Validation
const isValidPincode = function (value) {
    let pinCodeValidation = /^[0-9]{6}$/;
    if (!(pinCodeValidation.test(value))) return false
    return true
}

// Password Validation
const isValidPassword = function (value) {
    let passwordPattern = /^[a-zA-Z0-9!@#$%&*]{8,15}$/;
    if (!(passwordPattern.test(value))) return false
    return true
}


module.exports = {
    isValid,
    isValidEmail,
    isValidNumber,
    isValidRequestBody,
    isValidObjectId,
    isValidPincode,
    isValidPassword
}