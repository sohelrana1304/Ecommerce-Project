const mongoose = require('mongoose')



const isValid = function (value) {
    if ( value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidNumber = function (value) {
    const noNumber = /^(\+91[\-\s]?)?[0]?(91)?[6-9]\d{9}$/g
    if (typeof value !== 'string') return false
    if (noNumber.test(value) === false) return false
    return true
}


const isValidEmail = function (value) {
    let mailFormat = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    // Checking if the inputted email id perfectely formatted or not
    if (!(value.match(mailFormat))) return false
    return true

}

const isValidRequestBody = function (requestbody) {
    return Object.keys(requestbody).length > 0;
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const isValidPincode = function (value) {
    let pinCodeValidation = /^[0-9]{6}$/;
    if (!(pinCodeValidation.test(value))) return false
    return true
}

const isValidPassword=function(value){
    let passwordPattern = /^(?=.\d)(?=.[a-zA-Z])[a-zA-Z0-9!@#$%&*]{8,15}$/;
        if (!(passwordPattern.test(value))) return false
        return true
}

module.exports = { isValid, isValidEmail, isValidNumber, isValidRequestBody, isValidObjectId, isValidPincode,isValidPassword }