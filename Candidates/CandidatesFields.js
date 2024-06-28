const joi = require('joi');
const { CANDIDATES_ROLE } = require('../Constant');

// const registerUserFields = joi.object({
//     userName: joi.string().required().messages({ 'any.required': 'userName is required' }),
//     role: joi.string().valid(CANDIDATES_ROLE.CANDIDATE, CANDIDATES_ROLE.PARENT).required().messages({
//         'any.required': 'role is required',
//         'any.only': 'role must be either Candidate or parent'
//     })
// });

// const loginUserFields = joi.object({
//     role: joi.string().valid(CANDIDATES_ROLE.CANDIDATE, CANDIDATES_ROLE.PARENT).required().messages({
//         'any.required': 'role is required',
//         'any.only': 'role must be either Candidate or parent'
//     })
// })

const resetUserPasswordFields = joi.object({
    password: joi.string().required().messages({
        'any.required': 'password is required',
    })
})

// const adminCreate = joi.object({
//     userName: joi.string().min(3).max(30).required(),
//     email: joi.string().email().required(),
//     role: joi.string().valid('Admin', 'Sub-Admin', 'Mantor').required()
// })

module.exports = {
    // registerUserFields,
    // loginUserFields,
    resetUserPasswordFields,
}