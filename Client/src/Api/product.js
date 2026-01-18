import axios from "axios";
import toast from "react-hot-toast";
import { addProduct, deleteOneProduct } from "../Redux/index";

const BASE_URL = import.meta.env.VITE_API_URL;

// Function to create a product
export async function createProduct(data) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication token is missing");
  }

  try {
    // Ensure metafields exists
    const formattedData = {
      ...data,
      metafields: {
        caseMaterial: data.metafields?.caseMaterial || "",
        dialColor: data.metafields?.dialColor || "",
        waterResistance: data.metafields?.waterResistance || "",
        warrantyPeriod: data.metafields?.warrantyPeriod || "",
        movement: data.metafields?.movement || "",
        gender: data.metafields?.gender || "",
        caseSize: data.metafields?.caseSize || "",
      },
    };

    const response = await axios.post(`${BASE_URL}/products`, formattedData, {
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create product");
    }

    return response.data;
  } catch (error) {
    console.error("Create product error:", error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to create product");
  }
}

// Function to fetch all products
export function fetchProducts(dispatch, setLoading) {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Authentication token is missing");
    return;
  }

  setLoading && setLoading(true);

  axios
    .get(`${BASE_URL}/products`, {
      headers: { "x-auth-token": token },
    })
    .then((response) => {
      const productData = response?.data?.data;
      console.log("checking fetch", productData);
      if (!productData) {
        throw new Error("Invalid response from server");
      }
      dispatch(addProduct(productData));
    })
    .catch((error) => {
      handleAxiosError(error, "Server error while fetching products");
    })
    .finally(() => {
      setLoading && setLoading(false);
    });
}

// Function to delete a product
export function deleteProduct(id, dispatch, setLoading) {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Authentication token is missing");
    return;
  }

  setLoading && setLoading(true);

  // Optimistically delete from Redux store immediately
  dispatch(deleteOneProduct(id));
  setLoading && setLoading(false);

  // Delete from backend in background (async - don't block UI)
  axios
    .delete(`${BASE_URL}/products/${id}`, {
      headers: { "x-auth-token": token },
    })
    .then(() => {
      // Success - already removed from store optimistically
      toast.success("Product deleted successfully");
    })
    .catch((error) => {
      // Error - refetch to sync with server
      handleAxiosError(error, "Server error while deleting product");
      fetchProducts(dispatch, setLoading);
    });
}

export async function updateProduct(id, data) {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Authentication token is missing");
    return;
  }

  // Ensure that data is structured and validated
  const updatedData = {
    brand: data.brand,
    sku: data.sku,
    category: data.category,
    inventory: Number(data.inventory) || 0, // Ensure number
    price: Number(data.price) || 0, // Ensure number
    description: data.description || "No description provided", // Default value
    user: data.user || localStorage.getItem("userId"),
    metafields: {
      caseMaterial: data.caseMaterial,
      dialColor: data.dialColor,
      waterResistance: data.waterResistance,
      warrantyPeriod: data.warrantyPeriod,
      movement: data.movement,
      gender: data.gender,
      caseSize: data.caseSize,
    },
    // Support multiple images
    images: data.images && Array.isArray(data.images) 
      ? data.images.filter(img => img && img.url && img.url.trim() !== "")
      : [],
    // Backward compatibility: single image
    image: {
      url: data.image?.url || "",
      altText: data.image?.altText || "",
    },
  };

  try {
    // Send the updated data to the backend
    const response = await axios.put(`${BASE_URL}/products/${id}`, updatedData, {
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      throw new Error(
        error.response.data.details ||
          error.response.data.error ||
          "Update failed"
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      throw new Error("Network error - no response received");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
      throw error;
    }
  }
}


// Helper function to handle Axios errors
function handleAxiosError(error, defaultMessage) {
  if (error.response) {
    console.error("Error Response Data:", error.response.data);
    console.error("Error Response Status:", error.response.status);
    toast.error(error.response.data.message || defaultMessage);
  } else {
    console.error("Error Message:", error.message);
    toast.error("Network error. Please try again.");
  }
}
