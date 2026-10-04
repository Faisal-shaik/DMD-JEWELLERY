import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { Search, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [purity, setPurity] = useState(searchParams.get('purity') || '');
  const [availability, setAvailability] = useState(searchParams.get('availability') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories({ status: 'enabled' });
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.warn('Failed to load categories:', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        purity: searchParams.get('purity') || '',
        availability: searchParams.get('availability') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'latest',
      };

      const res = await fetchProducts(params);
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.warn('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (purity) params.purity = purity;
    if (availability) params.availability = availability;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;

    setSearchParams(params);
    setMobileFiltersOpen(false);
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setPurity('');
    setAvailability('');
    setMinPrice('');
    setMaxPrice('');
    setSort('latest');
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  const purities = ['24K', '22K', '20K', '18K'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Title */}
      <div className="text-center space-y-2 border-b border-gold-400/20 pb-6">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-gold-gradient uppercase tracking-tight">
          JEWELLERY CATALOGUE
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Explore our hallmark gold, diamond, and silver jewellery collections.
        </p>
      </div>

      {/* Search Bar & Mobile Filter Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-dark-800 p-4 rounded-2xl border border-gold-400/20 shadow">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by product name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full bg-dark-900 text-white pl-10 pr-4 py-2.5 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Sorting Dropdown & Filter Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:inline font-mono">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                const params = Object.fromEntries([...searchParams]);
                params.sort = e.target.value;
                setSearchParams(params);
              }}
              className="bg-dark-900 text-gold-300 text-xs py-2.5 px-3 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400"
            >
              <option value="latest">Latest Designs</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-gold-gradient text-dark-900 font-bold text-xs rounded-xl"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Layout (Left Filter Sidebar + Right Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside
          className={`lg:block bg-dark-800 p-6 rounded-2xl border border-gold-400/20 space-y-6 h-fit ${
            mobileFiltersOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between border-b border-gold-400/20 pb-3">
            <div className="flex items-center gap-2 text-gold-300 font-serif font-bold text-lg">
              <Filter className="w-4 h-4 text-gold-400" />
              <span>Filter Catalogue</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-gray-400 hover:text-gold-400 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-dark-900 text-gray-200 text-xs p-2.5 rounded-lg border border-gold-400/30 focus:outline-none focus:border-gold-400"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gold Purity Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Gold Purity
            </label>
            <div className="grid grid-cols-2 gap-2">
              {purities.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurity(purity === p ? '' : p)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    purity === p
                      ? 'bg-gold-gradient text-dark-900 border-gold-400'
                      : 'bg-dark-900 text-gray-300 border-gray-700 hover:border-gold-400/50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Availability
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full bg-dark-900 text-gray-200 text-xs p-2.5 rounded-lg border border-gold-400/30 focus:outline-none focus:border-gold-400"
            >
              <option value="">All Stock Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Available on Request">Available on Request</option>
            </select>
          </div>

          {/* Price Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Price Range (₹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 bg-dark-900 text-white text-xs p-2.5 rounded-lg border border-gold-400/30 focus:outline-none"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 bg-dark-900 text-white text-xs p-2.5 rounded-lg border border-gold-400/30 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full py-3 bg-gold-gradient text-dark-900 font-bold text-xs rounded-xl uppercase tracking-wider hover:brightness-110 shadow"
          >
            Apply Filters
          </button>
        </aside>

        {/* Right Product Grid */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading jewellery items...</div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* MANDATORY EMPTY STATE WHEN NO PRODUCTS IN DATABASE */
            <EmptyState
              title="OUR COLLECTION IS COMING SOON"
              description="New jewellery collections will be added soon. Please check back for our latest designs."
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
