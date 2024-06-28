const joi = require('joi');

const verifyAddlikesFeild = joi.object({
    candidateId: joi.string().required().messages({ 'any.required': 'candidateId is required' }),
    likeTo: joi.string().required().messages({
        'any.required': 'likeTo is required',
    })
});


module.exports = {
    verifyAddlikesFeild,
}