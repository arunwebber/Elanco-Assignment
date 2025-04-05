import express from 'express';
import { getCountries, getCountryByCode, filterCountriesByRegion, searchCountries } from '../controllers/countryController.js';

const router = express.Router();
router.get('/search', searchCountries);
router.get('/', getCountries);
router.get('/:code', getCountryByCode);
router.get('/region/:region', filterCountriesByRegion);


export default router;
