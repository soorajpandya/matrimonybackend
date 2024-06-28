const express = require('express');
const { getAllCountries, getAllStatesByCountry, getAllCitiesByState } = require('./locationController');

const locationRouter = express.Router();

locationRouter.get('/countries', getAllCountries);
locationRouter.post('/country/states', getAllStatesByCountry);
locationRouter.post('/state/cities', getAllCitiesByState);

module.exports = locationRouter;
