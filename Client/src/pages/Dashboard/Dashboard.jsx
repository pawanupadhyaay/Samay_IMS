import React, { useEffect, useState, useMemo, useCallback } from "react";
import "./Dashboard.css";
import Auth from "../Auth/Auth";
import InputBox from "../../components/InputBox/InputBox";
import { fetchProducts, fetchProductStats } from "../../Api/product";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../components/Table/Table";
import Footer from "../../components/Footer/Footer";
import _ from "lodash";
import SearchIcon from "../../assets/icons/search.svg";
import LottieBag from "../../components/Lottie/LottieBag/LottieBag";
import LottieWallet from "../../components/Lottie/LottieOutOfStock/LottieOutOfStock";
import LottieOutOfStock from "../../components/Lottie/LottieOutOfStock/LottieOutOfStock";
import { CSVLink } from "react-csv"; // Import CSVLink for export functionality

function Dashboard() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.productsReducer.products);
  const [loading, setLoading] = useState(false);
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");
  const [totalProduct, setTotalProduct] = useState(0);
  const [totalStoreValue, setTotalStoreValue] = useState(0);
  const [totalOutOfStock, setTotalOutOfStock] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(() => {
  return localStorage.getItem("selectedBrand") || "";
});


  // Fetch products for table (kept as-is; stats are fetched separately and exactly)
  useEffect(() => {
    const abortController = new AbortController();
    const cleanup = fetchProducts(dispatch, setLoading, abortController.signal, true); // keep current behavior
    
    // Cleanup: cancel request on unmount
    return () => {
      abortController.abort();
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [dispatch]);

  // Fetch exact stats (fast, no need to download all products)
  useEffect(() => {
    let isMounted = true;
    fetchProductStats()
      .then((res) => {
        if (!isMounted) return;
        const s = res?.data || {};
        setTotalProduct(s.totalProducts || 0);
        setTotalStoreValue(s.totalStoreValue || 0);
        setTotalOutOfStock(s.outOfStock || 0);
        setTotalStock(s.totalStock || 0);
      })
      .catch((err) => {
        console.error("Stats fetch failed:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Memoize filtered products for search (using debounced input)
  const filteredData = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return products.filter((data) => {
      const searchLower = debouncedSearchInput.toLowerCase();
      if (!searchLower) return true; // Show all if no search
      
      return (
        (data?.brand?.toLowerCase().includes(searchLower) || "") ||
        (data?.sku?.toLowerCase().includes(searchLower) || "") ||
        (data?.category?.toLowerCase().includes(searchLower) || "") ||
        (data?.description?.toLowerCase().includes(searchLower) || "") ||
        (data?.metafields?.caseMaterial?.toLowerCase().includes(searchLower) || "") ||
        (data?.metafields?.dialColor?.toLowerCase().includes(searchLower) || "") ||
        (data?.metafields?.waterResistance?.toLowerCase().includes(searchLower) || "") ||
        (data?.metafields?.warrantyPeriod?.toLowerCase().includes(searchLower) || "") ||
        (data?.metafields?.movement?.toLowerCase().includes(searchLower) || "") ||
        (data?.metafields?.gender?.toLowerCase().includes(searchLower) || "") ||
        (data?.metafields?.caseSize?.toLowerCase().includes(searchLower) || "")
      );
    });
  }, [debouncedSearchInput, products]);

  // Update table state from memoized filtered values
  useEffect(() => {
    setSearchProducts(filteredData);
  }, [filteredData]);

  // Function to handle brand selection for export
const handleBrandChange = (event) => {
  const selected = event.target.value;
  setSelectedBrand(selected);
  localStorage.setItem("selectedBrand", selected);
};


  // Filter products based on selected brand
  const filteredProducts = selectedBrand
    ? products.filter((product) => product.brand === selectedBrand)
    : products;

  // CSV headers
  const headers = [
    { label: "Brand", key: "brand" },
    { label: "SKU", key: "sku" },
    { label: "Category", key: "category" },
    { label: "Price", key: "price" },
    { label: "Inventory", key: "inventory" },
    { label: "Description", key: "description" },
    { label: "Case Material", key: "metafields.caseMaterial" },
    { label: "Dial Color", key: "metafields.dialColor" },
    { label: "Water Resistance", key: "metafields.waterResistance" },
    { label: "Warranty Period", key: "metafields.warrantyPeriod" },
    { label: "Movement", key: "metafields.movement" },
    { label: "Gender", key: "metafields.gender" },
    { label: "Case Size", key: "metafields.caseSize" },
  ];

  // Get unique brand names for the dropdown
  const brands = [...new Set(products.map(product => product.brand))].filter(Boolean); // Filter out empty values

  return (
    <div>
      {loading && products.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white text-sm">Loading products...</p>
          </div>
        </div>
      )}
      <div className="grid xl:grid-cols-5 md:grid-cols-4 grid-cols-1 gap-3 mb-3">
        <div className="card flex flex-row gap-3">
          <div className="xl:w-20 md:w-20 w-10 xl:h-20 md:h-20 h-10">
            <LottieBag isplay={true} />
          </div>
          <h3>Total products <br /> {totalProduct}</h3>
        </div>
        <div className="card flex flex-row gap-3">
          <div className="xl:w-20 md:w-20 w-10 xl:h-20 md:h-20 h-10">
            <LottieWallet isplay={true} />
          </div>
          <h3>Total Store Value <br /> ₹{totalStoreValue}</h3>
        </div>
        <div className="card flex flex-row gap-3">
          <div className="xl:w-20 md:w-20 w-10 xl:h-20 md:h-20 h-10">
            <LottieOutOfStock isplay={true} />
          </div>
          <h3>Out of Stock <br /> {totalOutOfStock}</h3>
        </div>
        
        <div className="card flex flex-row gap-3">
        <div className="xl:w-20 md:w-20 w-10 xl:h-20 md:h-20 h-10 flex items-center justify-center">
          📦
       </div>
       <h3>Total Stock <br /> {totalStock}</h3>
       </div>

        <div className="card">
          <InputBox
            name={"Search"}
            value={searchInput}
            setValue={setSearchInput}
            icon={SearchIcon}
            idName="searchInput"
          />
        </div>
      </div>

      {/* Brand Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="brandSelect" className="text-white">Select Brand</label>
        <select
          id="brandSelect"
          value={selectedBrand}
          onChange={handleBrandChange}
          className="p-2 rounded-lg bg-black text-white"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* CSV Export Button */}
      <div className="mb-4">
        <CSVLink
          data={filteredProducts}  // Data to export (filtered by selected brand)
          headers={headers}  // Column headers
          filename="products.csv"  // The file name for the exported CSV
        >
          <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Export Products to CSV
          </button>
        </CSVLink>
      </div>

      {/* Products Table */}
      <div className="card">
        <Table
  product={debouncedSearchInput ? searchProducts : filteredProducts}
  selectedBrand={selectedBrand}
  key={selectedBrand} // 👈 forces re-render when brand changes
/>

          </div>
    </div>
  );
}

export default Auth(Dashboard);
