import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;

function History() {
  const [history, setHistory] = useState([]);
  const [filterBrand, setFilterBrand] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing");
        return navigate("/");
      }

      const response = await axios.get(`${BASE_URL}/products/history`, {
        headers: { "x-auth-token": token },
      });

      if (response.data.success) {
        setHistory(response.data.data);
      } else {
        toast.error("No history data found");
      }
    } catch (error) {
      toast.error("Failed to fetch history");
      console.error("Error fetching history:", error.response || error.message);
    }
  }

  const getFieldValue = (product, fieldPath) => {
    const parts = fieldPath.split(".");
    let value = product;
    for (let part of parts) {
      value = value?.[part];
    }
    return value ?? "N/A";
  };

  const filteredHistory = history.filter((record) => {
    const matchBrand = filterBrand ? record.product?.brand === filterBrand : true;
    const matchUser = filterUser ? record.modifiedBy === filterUser : true;
    const matchSearch = searchInput
      ? (record.product?.brand?.toLowerCase().includes(searchInput.toLowerCase()) ||
         record.product?.sku?.toLowerCase().includes(searchInput.toLowerCase()) ||
         record.modifiedBy?.toLowerCase().includes(searchInput.toLowerCase()))
      : true;

    return matchBrand && matchUser && matchSearch;
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const currentItems = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-extrabold text-white mb-4">
        Product Modification History
      </h2>

      {/* 🔍 Search + Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search by Brand, SKU or User"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg bg-black text-white border border-gray-700 w-80"
        />

        <select
          value={filterBrand}
          onChange={(e) => {
            setFilterBrand(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg bg-black text-white border border-gray-700"
        >
          <option value="">All Brands</option>
          {[...new Set(
            history
              .map(h => h.product?.brand?.trim())
              .filter(brand => brand && brand !== "")
          )].map((brand, i) => (
            <option key={i} value={brand}>{brand}</option>
          ))}
        </select>

        <select
          value={filterUser}
          onChange={(e) => {
            setFilterUser(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg bg-black text-white border border-gray-700"
        >
          <option value="">All Users</option>
          {[...new Set(history.map(h => h.modifiedBy))].map((user, i) => (
            <option key={i} value={user}>{user}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border border-gray-700 text-white">
          <thead>
            <tr className="bg-gray-800 text-gray-300 text-lg">
              <th className="border px-6 py-3">Product</th>
              <th className="border px-6 py-3">SKU</th>
              <th className="border px-6 py-3">Modified By</th>
              <th className="border px-6 py-3">Modified Fields</th>
              <th className="border px-6 py-3">Action</th>
              <th className="border px-6 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400 text-lg">
                  No modifications found
                </td>
              </tr>
            ) : (
              currentItems.map((record, index) => (
                <tr key={index} className="border border-gray-600 text-gray-300 text-lg">
                  <td className="border px-6 py-4">{record.product?.brand || "Unknown"}</td>
                  <td className="border px-6 py-4">{record.product?.sku || "N/A"}</td>
                  <td className="border px-6 py-4">{record.modifiedBy || "Unknown"}</td>
                  <td className="border px-6 py-4 whitespace-pre-line">
                    {record.modifiedFields && record.modifiedFields.length > 0 ? (
                      record.modifiedFields.map((field, idx) => (
                        <div key={idx} className="text-sm leading-6">
                          {field}
                          </div>
                        
                      ))
                    ) : (
                      <span className="italic text-gray-500">No fields modified</span>
                    )}
                  </td>
                  <td className="border px-6 py-4 capitalize">{record.action}</td>
                  <td className="border px-6 py-4">
                    {new Date(record.timestamp).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-4 items-center text-white">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-700 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default History;
