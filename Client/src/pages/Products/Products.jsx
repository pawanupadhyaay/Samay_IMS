import React, { useState, useEffect } from "react";
import Auth from "../Auth/Auth";
import InputBox from "../../components/InputBox/InputBox";
import TextArea from "../../components/TextArea/TextArea";
import Button from "../../components/Button/Button";
import axios from "axios";
import toast from "react-hot-toast";

// Icons
import productIcon from "../../assets/icons/product.svg";
import listIcon from "../../assets/icons/list.svg";
import qrCodeIcon from "../../assets/icons/qrCode.svg";
import rupesIcon from "../../assets/icons/rupes.svg";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../Api/product";
import "./Products.css";

const BASE_URL = import.meta.env.VITE_API_URL;

function Products() {
  const [brand, setBrandName] = useState("");
  const [sku, setSkuCode] = useState("");
  const [category, setCategory] = useState("");
  const [inventory, setInventory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [caseMaterial, setCaseMaterial] = useState("");
  const [dialColor, setDialColor] = useState("");
  const [waterResistance, setWaterResistance] = useState("");
  const [warrantyPeriod, setWarrantyPeriod] = useState("");
  const [movement, setMovement] = useState("");
  const [gender, setGender] = useState("");
  const [caseSize, setCaseSize] = useState("");

  const [imageURLs, setImageURLs] = useState([""]);

  const dispatch = useDispatch();
  const products = useSelector((state) => state.productsReducer.products);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    // Only fetch if products array is empty
    if (!products || products.length === 0) {
      fetchProducts(dispatch);
    }
  }, [dispatch]);

  // Update brands when products change
  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueBrands = [...new Set(products.map(product => product.brand))].filter(Boolean);
      setBrands(uniqueBrands);
    }
  }, [products]);

  const handleImageChange = (index, value) => {
    const updated = [...imageURLs];
    updated[index] = value;
    setImageURLs(updated);
  };

  const handleAddImageField = () => {
    setImageURLs([...imageURLs, ""]);
  };

  function handleAddProduct() {
    const user = localStorage.getItem("userId");
    if (!user) return toast.error("User not authenticated");
    if (!brand || !sku || !inventory) {
      toast.error("Brand Name, SKU Code, and Inventory are required fields.");
      return;
    }

    const payload = {
      user,
      brand,
      sku,
      category,
      inventory: Number(inventory),
      price: Number(price),
      description,
      metafields: {
        caseMaterial,
        dialColor,
        waterResistance,
        warrantyPeriod,
        movement,
        gender,
        caseSize,
      },
      image: {
  url: imageURLs[0] || "",  // only first image URL used for now
  altText: "",              // optional: you can add altText field too
}
    };

    toast.promise(
      axios.post(`${BASE_URL}/products`, payload, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      })
        .then((response) => {
          toast.success("Product Added Successfully");
          setBrandName("");
          setSkuCode("");
          setCategory("");
          setInventory("");
          setPrice("");
          setDescription("");
          setCaseMaterial("");
          setDialColor("");
          setWaterResistance("");
          setWarrantyPeriod("");
          setMovement("");
          setGender("");
          setCaseSize("");
          setImageURLs([""]);
          // Fetch products to update the store with new product
          fetchProducts(dispatch);
          return response;
        })
        .catch((error) => {
          console.error("Error creating product:", error);
          throw error;
        }),
      {
        loading: "Adding product...",
        success: "Product added successfully!",
        error: "Failed to add product.",
      }
    );
  }

  return (
    <div className="w-full h-full">
      <div className="title w-full text-center mb-6 -mt-3">
        <h3 className="text-2xl font-bold">Add Products</h3>
      </div>

      <div className="card w-full h-full grid xl:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-3">
        <div className="form-field">
          <label htmlFor="brand" className="text-white">Brand Name</label>
          <select
            id="brand"
            value={brand}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full p-3 bg-black text-white rounded-md"
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <InputBox name={"SKU Code"} placeholder={"ex: SKU12345"} icon={qrCodeIcon} value={sku} setValue={setSkuCode} />
        <InputBox name={"Category"} placeholder={"ex: Luxury"} icon={listIcon} value={category} setValue={setCategory} />
        <InputBox name={"Inventory"} placeholder={"ex: 50"} icon={listIcon} value={inventory} setValue={setInventory} />
        <InputBox name={"Price"} placeholder={"ex: 35000"} icon={rupesIcon} value={price} setValue={setPrice} />
        <InputBox name={"Case Material"} placeholder={"ex: Stainless Steel"} value={caseMaterial} setValue={setCaseMaterial} />
        <InputBox name={"Dial Color"} placeholder={"ex: Black"} value={dialColor} setValue={setDialColor} />
        <InputBox name={"Water Resistance"} placeholder={"ex: 50m"} icon={listIcon} value={waterResistance} setValue={setWaterResistance} />
        <InputBox name={"Warranty Period"} placeholder={"ex: 2 Years"} value={warrantyPeriod} setValue={setWarrantyPeriod} />
        <InputBox name={"Movement"} placeholder={"ex: Quartz"} value={movement} setValue={setMovement} />
        <InputBox name={"Gender"} placeholder={"ex: Unisex"} value={gender} setValue={setGender} />
        <InputBox name={"Case Size"} placeholder={"ex: 42mm"} value={caseSize} setValue={setCaseSize} />
        <TextArea name={"Description"} nLines={9} value={description} setValue={setDescription} />

        <div className="form-field">
          <label className="text-white">Product Image URLs</label>
          {imageURLs.map((url, index) => (
            <input
              key={index}
              type="url"
              placeholder="Paste image URL"
              value={url}
              onChange={(e) => handleImageChange(index, e.target.value)}
              className="w-full mb-2 p-3 bg-black text-white rounded-md"
            />
          ))}
          {imageURLs[imageURLs.length - 1].trim() !== "" && (
            <button
              type="button"
              onClick={handleAddImageField}
              className="mt-2 p-2 bg-purple-600 text-white rounded-md"
            >
              + Add More Image URL
            </button>
          )}
        </div>

        <div />
        <div>
          <Button onClick={handleAddProduct}>Add Product</Button>
        </div>
      </div>
    </div>
  );
}

export default Auth(Products);