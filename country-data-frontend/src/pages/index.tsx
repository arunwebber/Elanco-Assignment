import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import InfiniteScroll from 'react-infinite-scroll-component';

const PAGE_SIZE = 40;

export default function Home() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchCountries = async (pageNum: number) => {
    try {
      const response = await axios.get(`http://localhost:3001/countries`, {
        params: {
          _page: pageNum,
          _limit: PAGE_SIZE,
        },
      });
      const newCountries = response.data;

      if (newCountries.length < PAGE_SIZE) setHasMore(false);

      setCountries((prev) => [...prev, ...newCountries]);
    } catch (err) {
      setError('Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries(page);
  }, [page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const allRegions = ['All', ...new Set(countries.map((c) => c.region).filter(Boolean))];

  const filteredCountries = countries.filter((country) => {
    const matchesSearch =
      (country?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (country?.capital || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (country?.timezones?.join(' ') || '').toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesRegion = selectedRegion === 'All' || country.region === selectedRegion;
  
    return matchesSearch && matchesRegion;
  });
  

  return (
    <div className="p-6">
      {/* Search Input */}
      <div className="mb-4">
      <label className="block text-gray-700">Search by Name, Capital, or Timezone </label>
      <input
          id="search"
          type="text"
          placeholder="Search by Name, Capital, or Timezone"
          className="border border-gray-300 p-2 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Region Filter */}
      <div className="mb-4">
        <label className="block text-gray-700">Filter by Region</label>
        <select
          className="border border-gray-300 p-2 w-full"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          {allRegions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Infinite Scroll Countries Grid */}
      <InfiniteScroll
        dataLength={countries.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<h4 className="text-center mt-4">Loading more countries...</h4>}
        endMessage={
          <p className="text-center text-gray-500 mt-4">
            <b>No more countries to load.</b>
          </p>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <Link
                key={country?.alpha3Code || country?.alpha2Code || country?.name}
                href={`/countries/${country?.code}`}
                passHref
              >
                <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition">
                  {country?.flag ? (
                    <img
                      className="w-10 h-10 object-cover mx-auto"
                      src={country.flag}
                      alt={`Flag of ${country.name}`}
                    />
                  ) : (
                    <p className="text-center">No Flag Available</p>
                  )}
                  <div className="mt-2 text-center">
                    <h2 className="font-semibold">{country?.name || 'Unnamed Country'}</h2>
                    <p className="text-gray-600">{country?.region || 'Unknown Region'}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">No countries found.</p>
          )}
        </div>
      </InfiniteScroll>
    </div>
  );
}
