// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

// const BASE_URL = import.meta.env.VITE_API_URL;

// function Bin() {
//   const [deletedProducts, setDeletedProducts] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchDeletedProducts();
//   }, []);

//   async function fetchDeletedProducts() {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Authentication token is missing");
//         return navigate("/");
//       }

//       const response = await axios.get(`${BASE_URL}/products/bin`, {
//         headers: { "x-auth-token": token },
//       });

//       setDeletedProducts(response.data.data);
//     } catch (error) {
//       toast.error("Failed to fetch deleted products");
//       console.error("Error fetching deleted products:", error);
//     }
//   }

//   async function restoreProduct(productId) {
//     try {
//       const response = await axios.patch(`${BASE_URL}/products/restore/${productId}`, {}, {
//         headers: { "x-auth-token": localStorage.getItem("token") },
//       });

//       toast.success("Product restored successfully!");
//       fetchDeletedProducts(); // Refresh bin list
//     } catch (error) {
//       toast.error("Failed to restore product");
//       console.error("Error restoring product:", error);
//     }
//   }

//   async function permanentlyDelete(productId) {
//     try {
//       const response = await axios.delete(`${BASE_URL}/products/permanent/${productId}`, {
//         headers: { "x-auth-token": localStorage.getItem("token") },
//       });

//       toast.success("Product permanently deleted!");
//       fetchDeletedProducts(); // Refresh bin list
//     } catch (error) {
//       toast.error("Failed to permanently delete product");
//       console.error("Error permanently deleting product:", error);
//     }
//   }

//   return (
//     <div className="p-6">
//       <h2 className="text-3xl font-extrabold text-white mb-4">Bin - Deleted Products</h2>

//       <div className="overflow-x-auto">
//         <table className="table-auto w-full border border-gray-700 text-white">
//           <thead>
//             <tr className="bg-gray-800 text-gray-300 text-lg">
//               <th className="border px-6 py-3">Brand</th>
//               <th className="border px-6 py-3">SKU</th>
//               <th className="border px-6 py-3">Category</th>
//               <th className="border px-6 py-3">Deleted On</th>
//               <th className="border px-6 py-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {deletedProducts.length === 0 ? (
//               <tr>
//                 <td colSpan="5" className="text-center py-6 text-gray-400 text-lg">
//                   No deleted products found
//                 </td>
//               </tr>
//             ) : (
//               deletedProducts.map((product) => (
//                 <tr key={product._id} className="border border-gray-600 text-gray-300 text-lg">
//                   <td className="border px-6 py-4">{product.brand}</td>
//                   <td className="border px-6 py-4">{product.sku}</td>
//                   <td className="border px-6 py-4">{product.category}</td>
//                   <td className="border px-6 py-4">{new Date(product.deletedAt).toLocaleString()}</td>
//                   <td className="border px-6 py-4">
//                     <button
//                       className="bg-green-600 px-3 py-1 rounded-lg mr-2"
//                       onClick={() => restoreProduct(product._id)}
//                     >
//                       Restore
//                     </button>
//                     <button
//                       className="bg-red-600 px-3 py-1 rounded-lg"
//                       onClick={() => permanentlyDelete(product._id)}
//                     >
//                       Delete Forever
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default Bin;
