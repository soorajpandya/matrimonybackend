const axios = require('axios');
const { MISSING_DEPENDENCY, INTERNAL_SERVER_ERROR } = require('../Constant');
const Joi = require('joi')

const getAllCountries = async (req, res) => {
    try {
        const response = await axios.get('https://countriesnow.space/api/v0.1/countries/flag/images');
        const countries = response.data;
        return res.status(200).json(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        return res.state(500).send({message:INTERNAL_SERVER_ERROR })
    }
};

const stateSchema = Joi.object({
    country: Joi.string().required()
});
const getAllStatesByCountry = async (req, res) => {
    try {
        const { error, value } = stateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: MISSING_DEPENDENCY, error: error.details[0].message });
        }
        const response = await axios.post('https://countriesnow.space/api/v0.1/countries/states', { ...value });
        const states = response.data.data.states;
        res.status(200).json(states);
    } catch (error) {
        console.error('Error fetching states:', error);
        return res.state(500).send({message:INTERNAL_SERVER_ERROR })
    }
};


const citySchema = Joi.object({
    country: Joi.string().required(),
    state: Joi.string().required()
});
const getAllCitiesByState = async (req, res) => {
    try {
        const { error, value } = citySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: MISSING_DEPENDENCY, error: error.details[0].message });
        }
        const response = await axios.post('https://countriesnow.space/api/v0.1/countries/state/cities', { ...value });
        const cities = response.data;
        res.status(200).json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        return res.state(500).send({message:INTERNAL_SERVER_ERROR })
    }
};

module.exports = {
    getAllCountries,
    getAllStatesByCountry,
    getAllCitiesByState
};
