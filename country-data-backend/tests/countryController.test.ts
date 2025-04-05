import request from 'supertest';
import express from 'express';
import * as controller from '../src/controllers/countryController';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = express();
app.use(express.json());
app.get('/countries', controller.getCountries);
app.get('/countries/:code', controller.getCountryByCode);
app.get('/region/:region', controller.filterCountriesByRegion);
app.get('/search', controller.searchCountries);

const mockData = [
  {
    name: 'India',
    flag: '🇮🇳',
    region: 'Asia',
    alpha2Code: 'IN',
    capital: ['New Delhi'],
    timezones: ['UTC+05:30'],
    population: 1400000000,
    languages: ['Hindi', 'English'],
    currencies: ['INR']
  },
  {
    name: 'France',
    flag: '🇫🇷',
    region: 'Europe',
    alpha2Code: 'FR',
    capital: ['Paris'],
    timezones: ['UTC+01:00'],
    population: 67000000,
    languages: ['French'],
    currencies: ['EUR']
  }
];

describe('Countries Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /countries should return paginated countries', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const res = await request(app).get('/countries?_page=1&_limit=1');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(mockedAxios.get).toHaveBeenCalled();
  });

  test('GET /countries/:code should return country by code', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        name: { common: 'India' },
        flag: '🇮🇳',
        population: 1400000000,
        languages: ['Hindi', 'English'],
        region: 'Asia',
        currencies: ['INR'],
        timezones: ['UTC+05:30'],
        capital: ['New Delhi']
      }
    });

    const res = await request(app).get('/countries/IN');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('India');
    expect(mockedAxios.get).toHaveBeenCalled();
  });

  test('GET /region/:region should return countries of that region', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const res = await request(app).get('/region/Europe');
    expect(res.status).toBe(200);
    expect(res.body[0].region).toBe('Europe');
  });

  test('GET /search?name=India should return matching country', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const res = await request(app).get('/search?name=India');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('India');
  });

  test('GET /search?capital=Paris should return France', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const res = await request(app).get('/search?capital=Paris');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('France');
  });

  test('Handles API failure gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API down'));

    const res = await request(app).get('/countries');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch countries, please try again later' });
  });
});
