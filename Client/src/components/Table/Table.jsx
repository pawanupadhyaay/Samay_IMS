import _ from "lodash";
import { useState, useEffect, useMemo } from "react";
import deleteIcon from "../../assets/icons/delete.svg";
import Modal from "./Modal";
import { deleteProduct } from "@/Api/product";
import { useDispatch } from "react-redux";
import { EditProduct } from "../EditProduct/EditProduct";
import { ViewProduct } from "../ViewProduct/ViewProduct";
import { toast } from "react-toastify";

function Table({ product = [], selectedBrand }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // On reload: restore saved page if same brand
  useEffect(() => {
    const savedPage = parseInt(localStorage.getItem("currentPage") || "1", 10);
    const savedBrand = localStorage.getItem("selectedBrand") || "";

    if (savedBrand === selectedBrand) {
      setCurrentPage(savedPage);
    } else {
      setCurrentPage(1);
      localStorage.setItem("currentPage", 1);
    }
  }, [selectedBrand]);

  // Force reset on brand change
  useEffect(() => {
    setCurrentPage(1);
    localStorage.setItem("currentPage", 1);
  }, [selectedBrand]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentProducts = useMemo(() => {
    return product.slice(indexOfFirstItem, indexOfLastItem);
  }, [product, indexOfFirstItem, indexOfLastItem]);

  const totalPages = useMemo(() => Math.ceil(product.length / itemsPerPage), [product]);

  const totalProductsForBrand = useMemo(() => {
    return selectedBrand
      ? product.filter((item) => item.brand === selectedBrand).length
      : 0;
  }, [product, selectedBrand]);

  const openDeleteModal = (productId) => {
    setProductToDelete(productId);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setProductToDelete(null);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete, dispatch, setIsLoading);
      closeDeleteModal();
      toast.success("Product deleted successfully");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > totalPages) {
      setCurrentPage(1);
      localStorage.setItem("currentPage", 1);
    } else {
      setCurrentPage(newPage);
      localStorage.setItem("currentPage", newPage);
    }
  };

  return (
    <div className="w-full">
      {isLoading && "deleting..."}
      {isModalOpen && (
        <Modal
          message="Are you sure you want to delete this product?"
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          onClose={closeDeleteModal}
        />
      )}

      {/* ✅ Show total products in brand – at the top-center */}
      {selectedBrand && totalProductsForBrand > 0 && (
        <div className="w-full text-center py-3 text-white text-base font-semibold">
          Total products in <span className="text-blue-400">{selectedBrand}</span>: {totalProductsForBrand}
        </div>
      )}

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 relative">
          <thead className="text-xs border-b uppercase bg-appBg-dark text-appColor-light">
            <tr>
              <th className="px-6 py-3">S/No</th>
              <th className="px-6 py-3">Brand</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Inventory</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Total Value</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {currentProducts &&
              currentProducts.map((item, index) => {
                const isOutOfStock = item?.inventory === 0;

                return (
                  <tr key={index} className="border-b border-appBg-semilight hover:bg-appBg-light">
                    <th className={`px-6 py-4 font-medium whitespace-nowrap dark:text-appColor-dark ${isOutOfStock ? "text-red-500" : ""}`}>
                      {indexOfFirstItem + index + 1}
                    </th>
                    <td className={`px-6 py-4 ${isOutOfStock ? "text-red-500" : ""}`}>{item?.brand}</td>
                    <td className={`px-6 py-4 ${isOutOfStock ? "text-red-500" : ""}`}>{item?.sku}</td>
                    <td className={`px-6 py-4 ${isOutOfStock ? "text-red-500" : ""}`}>{item?.category}</td>
                    <td className={`px-6 py-4 ${isOutOfStock ? "text-red-500" : ""}`}>{item?.inventory}</td>
                    <td className={`px-6 py-4 ${isOutOfStock ? "text-red-500" : ""}`}>₹{item?.price}</td>
                    <td className={`px-6 py-4 ${isOutOfStock ? "text-red-500" : ""}`}>₹{item?.price * item?.inventory}</td>
                    <td className="px-6 py-4 flex gap-4">
                      <ViewProduct id={item._id} />
                      <EditProduct id={item._id} />
                      <img
                        onClick={() => openDeleteModal(item?._id)}
                        src={deleteIcon}
                        className="w-4 h-4 cursor-pointer text-white"
                        alt="Delete"
                      />
                    </td>
                  </tr>
                );
              })}
            {_.isEmpty(currentProducts) && (
              <tr>
                <td colSpan="8" className="text-center text-white py-4">
                  No products available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination controls */}
        <div className="flex justify-center mt-4 items-center gap-4">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
          >
            Previous
          </button>

          <span className="text-white">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Table;
