import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Auth from "../Auth/Auth";
import InputBox from "../../components/InputBox/InputBox";
import { fetchProducts } from "../../Api/product";
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
  const [totalProduct, setTotalProduct] = useState(0);
  const [totalStoreValue, setTotalStoreValue] = useState(0);
  const [totalOutOfStock, setTotalOutOfStock] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(() => {
  return localStorage.getItem("selectedBrand") || "";
});


  // Fetch products on component mount
  useEffect(() => {
    fetchProducts(dispatch, setLoading);
  }, []);

  // Calculate statistics based on inventory data
  useEffect(() => {
    let filteredData = products?.filter((data) => {
      return (
        (data?.brand?.toLowerCase().includes(searchInput.toLowerCase()) || "") ||
        (data?.sku?.toLowerCase().includes(searchInput.toLowerCase()) || "") ||
        (data?.category?.toLowerCase().includes(searchInput.toLowerCase()) || "") ||
        (data?.description?.toLowerCase().includes(searchInput.toLowerCase()) || "") ||
        (data?.metafields?.caseMaterial?.toLowerCase().includes(searchInput.toLowerCase()) || "") ||
        (data?.metafields?.dialColor?.toLowerCase().includes(searchInput.toLowerCase()) || "") ||
        (data?.metafields?.waterResistance?.toLowerCase().includes(searchInput.toLowerCase()) || "") ||
        (data?.metafields?.warrantyPeriod?.toLowerCase().includes(searchInput.toLowerCase()) || "") ||
        (data?.metafields?.movement?.toLowerCase().includes(searchInput.toLowerCase()) || "") ||
        (data?.metafields?.gender?.toLowerCase().includes(searchInput.toLowerCase()) || "") ||
        (data?.metafields?.caseSize?.toLowerCase().includes(searchInput?.toLowerCase()) || "")
      );
    });
    setSearchProducts(filteredData);

    // Calculate total values based on the inventory and price schema:
    const outOfStockCount = products?.filter(product => product?.inventory <= 0).length;
    setTotalOutOfStock(outOfStockCount);

    const storeValue = products?.reduce((acc, obj) => {
      // Ensure price and inventory are numbers before multiplying
      const price = parseFloat(obj?.price) || 0;
      const inventory = parseInt(obj?.inventory, 10) || 0;
      return acc + (price * inventory); // multiplying inventory with price to get total store value
    }, 0);
    setTotalStoreValue(storeValue);

    const stockCount = products?.reduce((sum, p) => sum + (parseInt(p.inventory) || 0), 0);
    setTotalStock(stockCount);


    const total = products?.length;
    setTotalProduct(total);
  }, [searchInput, products]);

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
      {loading && <h3>Loading...</h3>}
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
  product={searchInput ? searchProducts : filteredProducts}
  selectedBrand={selectedBrand}
  key={selectedBrand} // 👈 forces re-render when brand changes
/>

      </div>
    </div>
  );
}

export default Auth(Dashboard);
