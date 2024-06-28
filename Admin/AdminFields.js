
const joi = require('joi')
const {USER_ROLE} = require('../Constant')

const adminCreate = joi.object({
    userName: joi.string().required(),
    role: joi.string().valid(USER_ROLE.ADMIN, USER_ROLE.SUB_ADMIN, USER_ROLE.MENTOR).required().messages({
        'any.required': 'role is required'
    })
})

const adminLoginfield = joi.object({
    role: joi.string().valid(USER_ROLE.ADMIN, USER_ROLE.SUB_ADMIN, USER_ROLE.MENTOR).required().messages({
        'any.required': 'enter valid role',
        'any.only': 'role must be either Admin or Sub-Admin or Mentor'
       
    })
})
module.exports = {adminCreate ,adminLoginfield }