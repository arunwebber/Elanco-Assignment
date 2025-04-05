import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CountryDetail() {
  const router = useRouter();
  const { code } = router.query;
  const [country, setCountry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;

    const fetchCountry = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/countries/${code}`);
        setCountry(response.data);
      } catch (err) {
        setError('Failed to load country details');
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, [code]);

  if (loading) return <div>Loading...</div>;
  if (error) return <p>{error}</p>;
  if (!country) return <p>Country not found</p>;
 console.log(country)
  // Extract currency info
  const currencies = Array.isArray(country.currency)
    ? country.currency.map((cur: any) => `${cur.name} (${cur.symbol})`).join(', ')
    : 'N/A';

  // Extract language info
  const languages = Array.isArray(country.languages)
    ? country.languages.map((lang: any) => lang.name).join(', ')
    : 'N/A';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{country.name}</h1>
      <p><strong>Population:</strong> {country.population?.toLocaleString() || 'N/A'}</p>
      <p><strong>Region:</strong> {country.region || 'N/A'}</p>
      <p><strong>Currency:</strong> {currencies}</p>
      <p><strong>Languages:</strong> {languages}</p>
      <p><strong>Capital:</strong> {country.capital}</p>
      <p><strong>Time Zone:</strong> {country.timeZone}</p>
      {country.flag && (
        <img
          src={country.flag}
          alt={`Flag of ${country.name}`}
          width={120}
          className="mt-4 border"
        />
      )}
    </div>
  );
}
