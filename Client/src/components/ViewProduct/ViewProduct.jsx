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
    const selectedProduct = products?.find((data) => data._id === id);
    if (selectedProduct) {
      console.log("Selected Product from Database:", selectedProduct);
      setProduct(selectedProduct);
    }
  }

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
                    <li>Case Material: {product?.caseMaterial}</li>
                    <li>Dial Color: {product?.dialColor}</li>
                    <li>Water Resistance: {product?.waterResistance}</li>
                    <li>Warranty Period: {product?.warrantyPeriod}</li>
                    <li>Movement: {product?.movement}</li>
                    <li>Gender: {product?.gender}</li>
                    <li>Case Size: {product?.caseSize}</li>
                  </ul>
                </div>
                <div className="mt-4 w-1/2 ">
                  <img
                    src={typeof product.image === "string" ? product.image : product?.image?.url}
                    alt={product?.image?.altText || "No Image Available"}
                    className="w-full h-auto"
                  />
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
