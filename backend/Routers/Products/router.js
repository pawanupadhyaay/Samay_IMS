const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { upload } = require("../../utils/fileUpload");
const { Product, validateProduct } = require("../../DB/products");
const History = require("../../DB/history"); 
const { adminAuth } = require("../../middleware/auth");
const historyRouter = require("./historyRoutes"); // Adjust path as necessary
router.use("/", historyRouter); // Now the history route is available under `/products/history`

// Removed History route logic as it is handled in historyRoutes.js

// ✅ Helper function for error handling
const handleError = (res, statusCode, message, details = "") => {
  console.error(`❌ ERROR: ${message}`, details);
  return res.status(statusCode).json({ error: message, details });
};

// ✅ Helper function for success response
const handleSuccess = (res, statusCode, data) => {
  return res.status(statusCode).json({ success: true, data });
};

// Get all products
router.get("/", async (req, res) => {
  
  try {
    const data = await Product.find({}).select({ user: 0 });

    if (!data || data.length === 0) {
      return handleSuccess(res, 200, []);
    }

    return handleSuccess(res, 200, data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return handleError(res, 500, "Internal Server Error", error.message);
  }
});

// Get one product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select({ user: 0 });

    if (!product) {
      return handleError(res, 404, "Product not found");
    }

    return handleSuccess(res, 200, product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return handleError(res, 500, "Internal Server Error", error.message);
  }
});

// Create a new product
router.post("/", async (req, res) => {
  try {
    const {
      user,
      brand,
      sku,
      category,
      inventory,
      price,
      description,
      metafields,
      image, // destructure image from body
    } = req.body;

    const product = new Product({
      user: user || null,
      brand: brand || "",
      sku: sku || "",
      category: category || "",
      inventory: inventory || 0,
      price: price || 0,
      description: description || "",
      metafields: {
        caseMaterial: metafields?.caseMaterial || "",
        dialColor: metafields?.dialColor || "",
        waterResistance: metafields?.waterResistance || "",
        warrantyPeriod: metafields?.warrantyPeriod || "",
        movement: metafields?.movement || "",
        gender: metafields?.gender || "",
        caseSize: metafields?.caseSize || "",
      },
      image: {
        url: image?.url || "", // ✅ supports plain URL from frontend
        altText: image?.altText || "", // optional
      },
    });

    const savedProduct = await product.save();

    const fieldsToLog = [
      "brand",
      "sku",
      "category",
      "inventory",
      "price",
      "description",
      ...Object.keys(product.metafields || {}).map((key) => `metafields.${key}`),
    ];

    if (product.image?.url) {
      fieldsToLog.push("image.url");
    }

    await History.create({
      product: savedProduct._id,
      
      sku: savedProduct.sku || "N/A",
      modifiedBy: req.user?.name || "Unknown",
      modifiedFields: fieldsToLog,
      action: "Create",
    });

    return res.status(201).json({
      success: true,
      data: savedProduct,
    });
  } catch (error) {
    console.error("Server error creating product:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
      error: error,
    });
  }
});



// Update a product by ID
router.put("/:id", upload.single("image"), async (req, res) => {
  const {
    user,
    brand,
    sku,
    category,
    inventory,
    price,
    description,
    metafields,
  } = req.body;

  // Optional validation if provided fields are being updated
  const { error } = validateProduct({
    user,
    brand,
    sku,
    category,
    inventory,
    price,
    description,
    metafields,
  });

  if (error) {
    return handleError(res, 400, "Validation Error", error.details[0].message);
  }

  try {
    const currentProduct = await Product.findById(req.params.id);
    // Prepare update fields
    const updateFields = {
      user,
      brand,
      sku,
      category,
      inventory: Number(inventory), // Ensure number
      price: Number(price), // Ensure number
      description,
      metafields,
    };

    // Add image field only if a new image is uploaded
  if (req.file) {
  updateFields.image = {
    url: req.file.path,
    altText: req.body?.altText || "",
  };
} else if (req.body.image?.url) {
  updateFields.image = {
    url: req.body.image.url,
    altText: req.body.image.altText || "",
  };
}


    // Clean out undefined or empty fields
    const cleanedUpdateFields = _.pickBy(updateFields, (value) => {
      if (_.isObject(value)) {
        return !_.isEmpty(value); // Keep non-empty objects
      }
      return value !== null && value !== ""; // Exclude null and empty strings
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: cleanedUpdateFields },
      { new: true }
    ).select({ user: 0 });

    if (!updatedProduct) {
      return handleError(res, 404, "Product not found");
    }
        


// Compare old and new values to find modified fields
const modifiedFields = [];

// Direct fields
["brand", "sku", "category", "inventory", "price", "description"].forEach(field => {
  if (
    currentProduct[field]?.toString().trim() !== updatedProduct[field]?.toString().trim()
  ) {
    modifiedFields.push(`${field}: ${currentProduct[field]} -> ${updatedProduct[field]}`);
  }
});


// Metafields
if (currentProduct.metafields && updatedProduct.metafields) {
  Object.keys(updatedProduct.metafields).forEach((key) => {
    if (currentProduct.metafields[key] !== updatedProduct.metafields[key]) {
      modifiedFields.push(`metafields.${key}: ${currentProduct.metafields[key]} -> ${updatedProduct.metafields[key]}`);
    }
  });
}

// Image fields
if (
  currentProduct.image?.url !== updatedProduct.image?.url
) {
  modifiedFields.push(`image.url updated`);

}

if (
  currentProduct.image?.altText !== updatedProduct.image?.altText
) {
  modifiedFields.push(`image.altText updated`);

}


// Log to history only if changes occurred
if (modifiedFields.length > 0) {
  await History.create({
    product: updatedProduct._id,
    sku: updatedProduct.sku,
    modifiedBy: req.user.name, // From JWT
    modifiedFields,
    action: "Update",
  });
}




    return handleSuccess(res, 200, updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return handleError(res, 500, "Internal Server Error", error.message);
  }
});

// Delete a product by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return handleError(res, 404, "Product not found");
    }

    // 📝 Create history entry for deletion
    const importantFields = ['brand', 'sku', 'category', 'inventory', 'price', 'description'];
    const modifiedFields = importantFields.filter(field => deletedProduct[field] !== undefined);

    await History.create({
      product: deletedProduct._id,
      sku: deletedProduct.sku,
      modifiedBy: req.user.name, // ✅ JWT-provided admin
      modifiedFields,
      action: "Delete",
    });

    return res.status(204).send(); // 204 = No Content
  } catch (error) {
    console.error("Error deleting product:", error);
    return handleError(res, 500, "Internal Server Error", error.message);
  }
});


module.exports = router;
