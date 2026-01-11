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
import { useState } from "react";

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
    image: {
      url: "",
      altText: "",
    },
  });

  const [isOpen, setIsOpen] = useState(false);
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

      setProductData({
        ...product,
        image: imageData,
        caseMaterial: product.caseMaterial || "",
        dialColor: product.dialColor || "",
        waterResistance: product.waterResistance || "",
        warrantyPeriod: product.warrantyPeriod || "",
        movement: product.movement || "",
        gender: product.gender || "",
        caseSize: product.caseSize || "",
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
      image: {
        url: productData.image?.url || "",
        altText: productData.image?.altText || "",
      },
    };

    if (!updatedData.description || updatedData.description.trim().length < 5) {
      return toast.error("Description must be at least 5 characters long");
    }

    try {
      const response = await updateProduct(id, updatedData);
      if (response) {
        toast.success("Product updated successfully!");
        fetchProducts(dispatch);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.details || "Failed to update product");
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
    <Dialog open={isOpen} onOpenChange={(e) => setIsOpen(e)}>
      <DialogTrigger asChild>
        <img
          src={editIcon}
          className="w-4 h-4 cursor-pointer text-white"
          onClick={handleEdit}
        />
      </DialogTrigger>
      <DialogContent className="flex flex-col sm:max-w-[1000px] max-h-[600px] overflow-y-auto bg-appBg-dark">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <div className="flex flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4 py-4">
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

            <div className="flex items-center justify-between gap-4">
              <button
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md text-xl font-bold"
                onClick={decrementInventory}
                disabled={productData.inventory <= 0}
              >
                -
              </button>
              <input
                type="number"
                value={productData.inventory}
                onChange={(e) => handleChange("inventory", e.target.value)}
                className="w-20 text-center p-2 border border-gray-300 rounded-md bg-black text-white"
                min="0"
                readOnly
              />
              <button
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md text-xl font-bold"
                onClick={incrementInventory}
              >
                +
              </button>
            </div>

            {/* ✅ Image URL input + preview */}
            <div className="flex flex-col gap-2">
              
              <InputBox
                name="Product Image"
                value={productData?.image?.url || ""}
                setValue={(value) =>
                  setProductData((prevData) => ({
                    ...prevData,
                    image: {
                      ...prevData.image,
                      url: value,
                    },
                  }))
                }
              />
              {productData.image?.url && (
                <img
                  src={productData.image.url}
                  alt={productData.image?.altText || "Product Image<"}
                  className="w-32 h-auto border rounded mt-2"
                />
              )}
            </div>

            <InputBox
              name="Price"
              value={productData?.price}
              setValue={(value) => handleChange("price", value)}
              type="number"
            />
            <InputBox
              name="caseMaterial"
              value={productData?.caseMaterial}
              setValue={(value) => handleChange("caseMaterial", value)}
            />
            <InputBox
              name="dialColor"
              value={productData?.dialColor}
              setValue={(value) => handleChange("dialColor", value)}
            />
            <InputBox
              name="waterResistance"
              value={productData?.waterResistance}
              setValue={(value) => handleChange("waterResistance", value)}
            />
            <InputBox
              name="warrantyPeriod"
              value={productData?.warrantyPeriod}
              setValue={(value) => handleChange("warrantyPeriod", value)}
            />
            <InputBox
              name="movement"
              value={productData?.movement}
              setValue={(value) => handleChange("movement", value)}
            />
            <InputBox
              name="gender"
              value={productData?.gender}
              setValue={(value) => handleChange("gender", value)}
            />
            <InputBox
              name="caseSize"
              value={productData?.caseSize}
              setValue={(value) => handleChange("caseSize", value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
