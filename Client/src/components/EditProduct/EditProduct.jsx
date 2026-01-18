import Button from "@/components/Button/Button";
import editIcon from "../../assets/icons/edit.svg";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InputBox from "../InputBox/InputBox";
import toast from "react-hot-toast";
import { fetchProducts, updateProduct } from "@/Api/product";
import { useDispatch, useSelector } from "react-redux";
import { updateProductInStore } from "@/Redux/index";
import { useState } from "react";
import { X } from "lucide-react";
import TextArea from "../TextArea/TextArea";

export function EditProduct({ id }) {
  const [productData, setProductData] = useState({
    brand: "",
    sku: "",
    category: "",
    inventory: "",
    price: "",
    description: "",
    caseMaterial: "",
    dialColor: "",
    waterResistance: "",
    warrantyPeriod: "",
    movement: "",
    gender: "",
    caseSize: "",
    images: [],
    image: {
      url: "",
      altText: "",
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();
  const products = useSelector((state) => state.productsReducer.products);

  const handleChange = (field, value) => {
    setProductData((prevData) => ({
      ...prevData,
      [field]: ["inventory", "price", "caseSize"].includes(field)
        ? Number(value) || 0
        : value,
    }));
  };

  const handleEdit = () => {
    const product = products.find((p) => p?._id === id);
    if (product) {
      // ✅ Normalize image field if it's in string format
      const imageData =
        typeof product.image === "string"
          ? { url: product.image, altText: "" }
          : product.image || { url: "", altText: "" };

      // ✅ Handle multiple images - use images array if available, otherwise convert single image
      let imagesArray = [];
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        imagesArray = [...product.images]; // Create a copy to avoid reference issues
      } else if (imageData.url) {
        // Convert single image to array for backward compatibility
        imagesArray = [{ url: imageData.url, altText: imageData.altText || "" }];
      }
      // If no images, keep empty array (imagesArray is already [])

      setProductData({
        ...product,
        images: imagesArray, // Always ensure it's an array
        image: imageData,
        caseMaterial: product.metafields?.caseMaterial || product.caseMaterial || "",
        dialColor: product.metafields?.dialColor || product.dialColor || "",
        waterResistance: product.metafields?.waterResistance || product.waterResistance || "",
        warrantyPeriod: product.metafields?.warrantyPeriod || product.warrantyPeriod || "",
        movement: product.metafields?.movement || product.movement || "",
        gender: product.metafields?.gender || product.gender || "",
        caseSize: product.metafields?.caseSize || product.caseSize || "",
      });
      setIsOpen(true);
    } else {
      toast.error("Product not found");
    }
  };

  const handleUpdate = async () => {
    if (!productData.user) {
      productData.user = localStorage.getItem("userId");
      if (!productData.user) return toast.error("User ID is missing.");
    }

    const updatedData = {
      brand: productData.brand,
      sku: productData.sku,
      category: productData.category,
      inventory: Number(productData.inventory) || 0,
      price: Number(productData.price) || 0,
      description: productData.description || "No description provided",
      user: productData.user,
      metafields: {
        caseMaterial: productData.caseMaterial,
        dialColor: productData.dialColor,
        waterResistance: productData.waterResistance,
        warrantyPeriod: productData.warrantyPeriod,
        movement: productData.movement,
        gender: productData.gender,
        caseSize: productData.caseSize,
      },
      images: productData.images && Array.isArray(productData.images) 
        ? productData.images.filter(img => img && img.url && img.url.trim() !== "")
        : [],
      image: {
        url: productData.image?.url || "",
        altText: productData.image?.altText || "",
      },
    };

    if (!updatedData.description || updatedData.description.trim().length < 5) {
      return toast.error("Description must be at least 5 characters long");
    }

    setIsSaving(true);
    try {
      // Optimistically update Redux store immediately
      dispatch(updateProductInStore(id, {
        ...updatedData,
        metafields: updatedData.metafields,
        images: updatedData.images,
        image: updatedData.image,
      }));

      // Close dialog immediately for better UX
      setIsOpen(false);
      toast.success("Product updated successfully!");

      // Update in background (don't await - let it happen async)
      updateProduct(id, updatedData)
        .then((response) => {
          // Backend response structure: { success: true, data: updatedProduct }
          // response is already response.data from axios, so response.data is the actual product
          if (response && response.success && response.data) {
            const updatedProduct = response.data;
            // Update Redux store with backend response (includes updated images array)
            dispatch(updateProductInStore(id, {
              ...updatedProduct,
              // Ensure images array is properly included from backend response
              images: updatedProduct.images || [],
              metafields: updatedProduct.metafields || updatedData.metafields,
            }));
          } else {
            // If response doesn't have expected structure, refetch to sync
            fetchProducts(dispatch);
          }
        })
        .catch((error) => {
          console.error("Error updating product:", error);
          // Revert: refetch original data if update fails
          fetchProducts(dispatch);
          toast.error(error.message || error.response?.data?.details || "Failed to update product");
        })
        .finally(() => {
          setIsSaving(false);
        });
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.message || error.response?.data?.details || "Failed to update product");
      setIsSaving(false);
      // Revert on error
      fetchProducts(dispatch);
    }
  };

  const incrementInventory = () => {
    setProductData((prevData) => ({
      ...prevData,
      inventory: prevData.inventory + 1,
    }));
  };

  const decrementInventory = () => {
    if (productData.inventory > 0) {
      setProductData((prevData) => ({
        ...prevData,
        inventory: prevData.inventory - 1,
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpenValue) => setIsOpen(isOpenValue)}>
      <DialogTrigger asChild>
        <img
          src={editIcon}
          className="w-4 h-4 cursor-pointer text-white"
          onClick={handleEdit}
        />
      </DialogTrigger>
      <DialogContent 
        className="flex flex-col w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-[1100px] max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 shadow-2xl [&>button]:hidden p-3 sm:p-4 md:p-6"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Professional Header with Close Button */}
        <DialogHeader className="relative pb-3 sm:pb-4 border-b border-gray-700 pr-8 sm:pr-10">
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="truncate">Edit Product</span>
          </DialogTitle>
          <p className="text-xs sm:text-sm text-gray-400">Update product details and images</p>
          {/* Custom Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-0 top-0 rounded-full p-1.5 sm:p-2 hover:bg-gray-700 active:bg-gray-600 transition-colors duration-200 group touch-manipulation"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-1 sm:px-2 md:px-4 py-3 sm:py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Information
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <InputBox
                    name="Brand"
                    value={productData?.brand}
                    setValue={(value) => handleChange("brand", value)}
                    readOnly
                  />
                  <InputBox
                    name="SKU"
                    value={productData?.sku}
                    setValue={(value) => handleChange("sku", value)}
                    readOnly
                  />
                  <InputBox
                    name="Category"
                    value={productData?.category}
                    setValue={(value) => handleChange("category", value)}
                    readOnly
                  />

                  {/* Inventory Control */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-300">Inventory</label>
                    <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 bg-gray-900/50 rounded-lg p-2 sm:p-3 border border-gray-700">
                      <button
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-gray-600 rounded-lg text-lg sm:text-xl font-bold text-white hover:bg-red-600 hover:border-red-500 active:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                        onClick={decrementInventory}
                        disabled={productData.inventory <= 0}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={productData.inventory}
                        onChange={(e) => handleChange("inventory", e.target.value)}
                        className="w-20 sm:w-24 text-center p-1.5 sm:p-2 border-2 border-gray-600 rounded-lg bg-gray-800 text-white font-semibold text-base sm:text-lg focus:outline-none focus:border-blue-500"
                        min="0"
                        readOnly
                      />
                      <button
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-gray-600 rounded-lg text-lg sm:text-xl font-bold text-white hover:bg-green-600 hover:border-green-500 active:bg-green-700 transition-all duration-200 touch-manipulation"
                        onClick={incrementInventory}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <InputBox
                    name="Price (₹)"
                    value={productData?.price}
                    setValue={(value) => handleChange("price", value)}
                    type="number"
                  />
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </h3>
                <TextArea
                  name="Description"
                  nLines={3}
                  value={productData?.description || ""}
                  setValue={(value) => handleChange("description", value)}
                />
              </div>
            </div>

            {/* Right Column - Images & Metafields */}
            <div className="space-y-3 sm:space-y-4">

              {/* ✅ Multiple Images Section */}
              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Product Images</span>
                  {productData.images && productData.images.length > 0 && (
                    <span className="px-2 py-0.5 sm:px-2 sm:py-1 bg-blue-600 text-white text-xs rounded-full">
                      {productData.images.length}
                    </span>
                  )}
                </h3>
                
                {/* Images List */}
                <div className="flex flex-col gap-2 sm:gap-3 max-h-60 sm:max-h-72 md:max-h-80 overflow-y-auto pr-1 sm:pr-2">
                  {productData.images && Array.isArray(productData.images) && productData.images.length > 0 ? (
                    productData.images.map((img, index) => (
                      <div key={`image-${index}-${img.url || 'empty'}`} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start border-2 border-gray-700 rounded-lg p-2 sm:p-3 bg-gray-900/50 hover:border-gray-600 transition-colors">
                        <div className="flex-1 space-y-2 w-full">
                          <InputBox
                            name={`Image ${index + 1} URL`}
                            value={img.url || ""}
                            setValue={(value) => {
                              const updatedImages = [...productData.images];
                              updatedImages[index] = { ...updatedImages[index], url: value };
                              setProductData((prevData) => ({
                                ...prevData,
                                images: updatedImages,
                              }));
                            }}
                          />
                          {img.url && (
                            <div className="relative w-full">
                              <img
                                src={img.url}
                                alt={img.altText || `Product Image ${index + 1}`}
                                className="w-full sm:max-w-xs h-auto border-2 border-gray-700 rounded-lg mt-2"
                                onError={(e) => {
                              e.target.style.display = "none";
                            }}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedImages = productData.images.filter((_, i) => i !== index);
                            setProductData((prevData) => ({
                              ...prevData,
                              images: updatedImages,
                            }));
                          }}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1 flex-shrink-0 w-full sm:w-auto touch-manipulation"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8 border-2 border-dashed border-gray-700 rounded-lg">
                      <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400 text-xs sm:text-sm">No images added</p>
                    </div>
                  )}
                </div>

                {/* Add Image Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Use functional update to ensure we get latest state
                    setProductData((prevData) => {
                      // Ensure images is always an array
                      const currentImages = Array.isArray(prevData.images) ? prevData.images : [];
                      // Create new array with new image object
                      const newImages = [...currentImages, { url: "", altText: "" }];
                      // Return updated state
                      return {
                        ...prevData,
                        images: newImages,
                      };
                    });
                  }}
                  className="mt-3 sm:mt-4 w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 transition-all duration-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-lg touch-manipulation"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add New Image</span>
                </button>
              </div>

              {/* Metafields Section */}
              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Product Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <InputBox
                    name="Case Material"
                    value={productData?.caseMaterial}
                    setValue={(value) => handleChange("caseMaterial", value)}
                  />
                  <InputBox
                    name="Dial Color"
                    value={productData?.dialColor}
                    setValue={(value) => handleChange("dialColor", value)}
                  />
                  <InputBox
                    name="Water Resistance"
                    value={productData?.waterResistance}
                    setValue={(value) => handleChange("waterResistance", value)}
                  />
                  <InputBox
                    name="Warranty Period"
                    value={productData?.warrantyPeriod}
                    setValue={(value) => handleChange("warrantyPeriod", value)}
                  />
                  <InputBox
                    name="Movement"
                    value={productData?.movement}
                    setValue={(value) => handleChange("movement", value)}
                  />
                  <InputBox
                    name="Gender"
                    value={productData?.gender}
                    setValue={(value) => handleChange("gender", value)}
                  />
                  <InputBox
                    name="Case Size"
                    value={productData?.caseSize}
                    setValue={(value) => handleChange("caseSize", value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Professional Footer */}
        <DialogFooter className="border-t border-gray-700 pt-3 sm:pt-4 mt-3 sm:mt-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 active:bg-gray-500 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation order-2 sm:order-1"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base touch-manipulation order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
