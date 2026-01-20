import * as React from "react";
import { useSelector } from "react-redux";
import { useState } from "react";
import eyeIcon from "../../assets/icons/eye.svg";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function ViewProduct({ id }) {
  const products = useSelector((state) => state.productsReducer.products);
  const [product, setProduct] = useState({
    brand: "",
    sku: "",
    category: "",
    inventory: 0,
    price: 0,
    description: "",
    metafields: {
      caseMaterial: "",
      dialColor: "",
      waterResistance: "",
      warrantyPeriod: "",
      movement: "",
      gender: "",
      caseSize: "",
    },
    image: {
      url: "",
      altText: "",
    },
  });

  function handleView() {
    // Always get latest product from Redux when drawer opens
    const selectedProduct = products?.find((data) => data._id === id);
    if (selectedProduct) {
      // Ensure images array is properly initialized with latest data
      const productWithImages = {
        ...selectedProduct,
        images: Array.isArray(selectedProduct.images) 
          ? selectedProduct.images.filter(img => img && img.url && img.url.trim() !== "")
          : [],
      };
      setProduct(productWithImages);
    }
  }

  // Update product when Redux products change (for real-time updates)
  React.useEffect(() => {
    if (id && products && products.length > 0) {
      const selectedProduct = products.find((data) => data._id === id);
      if (selectedProduct) {
        // Ensure images array is properly initialized with latest data
        const productWithImages = {
          ...selectedProduct,
          images: Array.isArray(selectedProduct.images) 
            ? selectedProduct.images.filter(img => img && img.url && img.url.trim() !== "")
            : [],
        };
        setProduct(productWithImages);
      }
    }
  }, [id, products]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <img
          src={eyeIcon}
          className="w-4 h-4 cursor-pointer text-white"
          onClick={() => {
            handleView();
          }}
        />
      </DrawerTrigger>
      <DrawerContent className="bg-appBg-dark">
        <div className="mx-auto w-full max-w-sm">
          {product ? (
            <>
              <DrawerHeader>
                <DrawerTitle className="text-5xl">{product?.brand}</DrawerTitle>
                <DrawerDescription>{product?.description}</DrawerDescription>
                <DrawerDescription className="text-xl">
                  SKU: {product?.sku}
                </DrawerDescription>
                <DrawerDescription className="text-xl">
                  Category: {product?.category}
                </DrawerDescription>
                <DrawerDescription className="text-xl">
                  Price: &#x20b9; {product?.price}
                </DrawerDescription>
                <DrawerDescription className="text-xl">
                  Quantity: {product?.inventory}
                </DrawerDescription>
                <DrawerDescription className="text-xl">
                  Total: &#x20b9; {product?.inventory * product?.price}
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex gap-10">
                <div className="mt-4">
                  <h3 className="text-lg font-bold">Metafields:</h3>
                  <ul className="list-disc ml-6 w-full">
                    <li>Case Material: {product?.metafields?.caseMaterial || product?.caseMaterial || "N/A"}</li>
                    <li>Dial Color: {product?.metafields?.dialColor || product?.dialColor || "N/A"}</li>
                    <li>Water Resistance: {product?.metafields?.waterResistance || product?.waterResistance || "N/A"}</li>
                    <li>Warranty Period: {product?.metafields?.warrantyPeriod || product?.warrantyPeriod || "N/A"}</li>
                    <li>Movement: {product?.metafields?.movement || product?.movement || "N/A"}</li>
                    <li>Gender: {product?.metafields?.gender || product?.gender || "N/A"}</li>
                    <li>Case Size: {product?.metafields?.caseSize || product?.caseSize || "N/A"}</li>
                  </ul>
                </div>
                <div className="mt-4 w-1/2">
                  {/* Multiple Images Display */}
                  {product?.images && Array.isArray(product.images) && product.images.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold mb-2">Product Images ({product.images.length})</h3>
                      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
                        {product.images.map((img, index) => (
                          <img
                            key={`img-${index}-${img.url || 'empty'}-${Date.now()}`} // Force re-render with timestamp
                            src={`${img.url}?t=${Date.now()}`} // Cache busting for immediate update
                            alt={img.altText || `Product Image ${index + 1}`}
                            className="w-full h-auto border rounded"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/300?text=Image+Not+Found";
                              e.target.onerror = null; // Prevent infinite loop
                            }}
                            onLoad={(e) => {
                              // Image loaded successfully
                              e.target.style.opacity = "1";
                            }}
                            loading="lazy"
                            style={{ opacity: 0, transition: 'opacity 0.3s' }} // Fade in effect
                          />
                        ))}
                      </div>
                    </div>
                  ) : product?.image?.url || (typeof product?.image === "string" && product.image) ? (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold mb-2">Product Image</h3>
                      <img
                        key={`single-img-${product?.image?.url || product?.image}-${Date.now()}`}
                        src={`${typeof product.image === "string" ? product.image : product?.image?.url}?t=${Date.now()}`}
                        alt={product?.image?.altText || "Product Image"}
                        className="w-full h-auto border rounded"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300?text=Image+Not+Found";
                          e.target.onerror = null; // Prevent infinite loop
                        }}
                        onLoad={(e) => {
                          e.target.style.opacity = "1";
                        }}
                        loading="lazy"
                        style={{ opacity: 0, transition: 'opacity 0.3s' }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold mb-2">Product Images</h3>
                      <div className="text-center py-8 border-2 border-dashed rounded">
                        <p className="text-gray-400">No images available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
