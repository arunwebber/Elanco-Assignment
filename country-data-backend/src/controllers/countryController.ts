import { Request, Response } from 'express';
import axios from 'axios';
import http from 'http';
import https from 'https';

const axiosInstance = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

 //const REST_COUNTRIES_API = 'https://restcountries.com/v3.1/all';
//  const REST_COUNTRIES_API = 'https://restcountries.com/v3.1/region/europe';
const REST_COUNTRIES_API = 'http://localhost:9090/restcountries-2.0.5/rest/v2/all';


// Get all countries
export const getCountries = async (req: Request, res: Response) => {
  console.log('Fetching all countries...');

  try {
    const response = await axios.get(REST_COUNTRIES_API, { timeout: 1000000 });
    console.log('API response received');

    const allCountries = response.data.map((country: any) => ({
      name: country.name,
      flag: country.flag,
      region: country.region,
      code: country.alpha2Code,
      capital: country.capital,
      timezones: country.timezones,
    }));
    

    // Get pagination parameters
    const page = parseInt(req.query._page as string) || 1;
    const limit = parseInt(req.query._limit as string) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedCountries = allCountries.slice(startIndex, endIndex);

    res.json(paginatedCountries);
  } catch (error: any) {
    console.error('Error fetching countries:', error.message);
    res.status(500).json({ error: 'Failed to fetch countries, please try again later' });
  }
};



// Get country by code
export const getCountryByCode = async (req: Request, res: Response) => {
  console.log('Fetching country by code...');
  try{
  const { code } = req.params;
    const response = await axios.get(`http://localhost:9090/restcountries-2.0.5/rest/v2/alpha/${code}`);
    console.log('API response received');
    const country = response.data;
    res.json({
      name: country.name.common,
      flag: country.flag,
      population: country.population,
      languages: country.languages,
      region: country.region,
      currency: country.currencies,
      timeZone:country.timezones,
      capital:country.capital
    });
  }catch (error: any) {
    console.error('Error fetching country by code:', error.message);
    res.status(500).json({ error: 'Failed to fetch countries, please try again later' });
  }
};

// Filter countries by region
export const filterCountriesByRegion = async (req: Request, res: Response) => {
  console.log('Fetching country by region...');
  try{
  const { region } = req.params;
    const response = await axios.get(REST_COUNTRIES_API);
    console.log('API response received');
    const countries = response.data.filter((country: any) => country.region === region);
    res.json(countries);
  }catch (error: any) {
    console.error('Error fetching country by code:', error.message);
    res.status(500).json({ error: 'Failed to fetch countries, please try again later' });
  }
};

// Search countries
export const searchCountries = async (req: Request, res: Response) => {
  console.log('Searching for countries...');
  try{
  const { name, capital, region, timezone } = req.query;
    const response = await axios.get(REST_COUNTRIES_API);
    console.log('Api response recived')
    let countries = response.data;
    if (name) {
      countries = countries.filter((country: any) =>
        country.name.toLowerCase().includes((name as string).toLowerCase())
      );
    }
    if (capital) {
      countries = countries.filter((country: any) =>
        country.capital && country.capital[0].toLowerCase().includes((capital as string).toLowerCase())
      );
    }
    if (region) {
      countries = countries.filter((country: any) => country.region === region);
    }
    if (timezone) {
      countries = countries.filter((country: any) => country.timezones.includes(timezone as string));
    }
    res.json(countries);
  }catch (error: any) {
    console.error('Error searching for countries:', error.message);
    res.status(500).json({ error: 'Failed to fetch countries, please try again later' });
  }
}
