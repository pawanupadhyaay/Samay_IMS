import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Auth from "../Auth/Auth";

const BASE_URL = import.meta.env.VITE_API_URL;

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBrand, setFilterBrand] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const itemsPerPage = 100; // Match backend default limit
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();
    
    // Fetch history with cancellation support
    fetchHistory(currentPage, abortController.signal);
    
    // Cleanup: cancel request on unmount or page change
    return () => {
      abortController.abort();
    };
  }, [currentPage]);

  async function fetchHistory(page = 1, signal = null) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing");
        return navigate("/");
      }

      const response = await axios.get(`${BASE_URL}/products/history`, {
        headers: { "x-auth-token": token },
        params: {
          page: page,
          limit: itemsPerPage,
        },
        signal: signal, // Add abort signal for request cancellation
      });

      // Check if response is successful
      if (response.data && response.data.success === true) {
        // Success response with data
        const historyData = response.data.data || [];
        setHistory(historyData);
        
        // Update pagination metadata if available
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        setHistory([]);
      }
    } catch (error) {
      // Don't show error if request was cancelled
      if (axios.isCancel && axios.isCancel(error)) {
        console.log("History request cancelled:", error.message);
        return;
      }
      
      console.error("Error fetching history:", error.response?.data || error.message);
      
      // Only show toast if not a cancellation
      if (error.response?.status === 404) {
        toast.error("History route not found");
      } else if (error.response?.status === 403) {
        toast.error("Access denied");
      } else if (error.response?.status === 401) {
        toast.error("Authentication failed");
      } else if (error.code !== 'ERR_CANCELED') {
        // Don't show error for cancelled requests
        toast.error("Failed to fetch history");
      }
      
      setHistory([]);
      setPagination({
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } finally {
      setLoading(false);
    }
  }

  // Memoize unique brands to avoid recalculating on every render
  const uniqueBrands = useMemo(() => {
    return [...new Set(
      history
        .map(h => h.product?.brand?.trim())
        .filter(brand => brand && brand !== "")
    )];
  }, [history]);

  // Memoize unique users to avoid recalculating on every render
  const uniqueUsers = useMemo(() => {
    return [...new Set(history.map(h => h.modifiedBy).filter(Boolean))];
  }, [history]);

  // Memoize filtered history to avoid recalculating on every render
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    const searchLower = searchInput.toLowerCase();
    return history.filter((record) => {
      const matchBrand = filterBrand ? record.product?.brand === filterBrand : true;
      const matchUser = filterUser ? record.modifiedBy === filterUser : true;
      const matchSearch = searchInput
        ? (record.product?.brand?.toLowerCase().includes(searchLower) ||
           record.product?.sku?.toLowerCase().includes(searchLower) ||
           record.modifiedBy?.toLowerCase().includes(searchLower))
        : true;

      return matchBrand && matchUser && matchSearch;
    });
  }, [history, filterBrand, filterUser, searchInput]);

  // Use backend pagination - no need for frontend slicing since backend handles it
  // But we still filter/search on client side for the current page
  const currentItems = useMemo(() => {
    return filteredHistory; // Already filtered and paginated by backend
  }, [filteredHistory]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-extrabold text-white mb-4">
        Product Modification History
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white text-sm">Loading history...</p>
          </div>
        </div>
      ) : (
        <>
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
          {uniqueBrands.map((brand, i) => (
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
          {uniqueUsers.map((user, i) => (
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
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-4 items-center text-white">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-4 py-2 bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors"
          >
            Prev
          </button>
          <span>
            Page <strong>{currentPage}</strong> of <strong>{pagination.totalPages}</strong> 
            {pagination.totalCount > 0 && (
              <span className="text-gray-400 ml-2">
                ({pagination.totalCount} total records)
              </span>
            )}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors"
          >
            Next
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default Auth(History);
