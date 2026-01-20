const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { upload } = require("../../utils/fileUpload");
const { Product, validateProduct } = require("../../DB/products");
const History = require("../../DB/history"); 
const { adminAuth } = require("../../middleware/auth");

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

// Get all products with pagination (backward compatible)
router.get("/", async (req, res) => {
  
  try {
    // Check if all products are requested (for statistics)
    const getAll = req.query.all === "true" || req.query.all === "1";
    
    // Pagination parameters (optional for backward compatibility)
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = page ? (page - 1) * limit : 0;
    const maxLimit = 1000; // Maximum limit for safety

    // If all=true, return all products (for statistics)
    if (getAll) {
      const data = await Product.find({})
        .select({ user: 0 })
        .lean();
      
      return handleSuccess(res, 200, data || []);
    }

    // If pagination params provided, use pagination
    if (page && limit) {
      const actualLimit = Math.min(limit, maxLimit);
      
      // Calculate total count for pagination metadata
      const totalCount = await Product.countDocuments({});
      
      // Use lean() for faster queries - returns plain JS objects
      const data = await Product.find({})
        .select({ user: 0 })
        .skip(skip)
        .limit(actualLimit)
        .lean();

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / actualLimit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return res.status(200).json({
        success: true,
        data: data || [],
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalCount: totalCount,
          limit: actualLimit,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage,
        },
      });
    } else {
      // Backward compatibility: Return all products but limit to 1000 for safety
      const data = await Product.find({})
        .select({ user: 0 })
        .limit(maxLimit)
        .lean();

      return handleSuccess(res, 200, data || []);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return handleError(res, 500, "Internal Server Error", error.message);
  }
});

// ✅ Lightweight stats endpoint (fast, exact, no need to fetch all products)
router.get("/stats", async (req, res) => {
  try {
    const [result] = await Product.aggregate([
      // Ensure inventory/price are treated as numbers even if stored as strings
      {
        $addFields: {
          _invNum: {
            $convert: {
              input: "$inventory",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
          _priceNum: {
            $convert: {
              input: "$price",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$_invNum" },
          totalStoreValue: {
            $sum: {
              $multiply: ["$_invNum", "$_priceNum"],
            },
          },
          outOfStock: {
            $sum: {
              $cond: [{ $lte: ["$_invNum", 0] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalStock: 1,
          totalStoreValue: 1,
          outOfStock: 1,
        },
      },
    ]);

    return handleSuccess(res, 200, result || {
      totalProducts: 0,
      totalStock: 0,
      totalStoreValue: 0,
      outOfStock: 0,
    });
  } catch (error) {
    console.error("Error fetching product stats:", error);
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
      image, // destructure image from body (backward compatibility)
      images, // multiple images array
    } = req.body;

    // Handle multiple images
    let imagesArray = [];
    if (images && Array.isArray(images) && images.length > 0) {
      imagesArray = images
        .filter(img => img && img.url && img.url.trim() !== "")
        .map(img => ({
          url: img.url.trim(),
          altText: img.altText || "",
        }));
    } else if (image?.url) {
      // Backward compatibility: convert single image to array
      imagesArray = [{ url: image.url.trim(), altText: image.altText || "" }];
    }

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
      images: imagesArray,
      image: {
        url: image?.url || "", // ✅ supports plain URL from frontend (backward compatibility)
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

    if (product.images && product.images.length > 0) {
      fieldsToLog.push(`images (${product.images.length} images)`);
    } else if (product.image?.url) {
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

    // Handle multiple images (images array)
    if (req.body.images && Array.isArray(req.body.images)) {
      // Filter out empty images and ensure proper structure
      updateFields.images = req.body.images
        .filter(img => img && img.url && img.url.trim() !== "")
        .map(img => ({
          url: img.url.trim(),
          altText: img.altText || "",
        }));
    } else if (req.body.images) {
      // If images is not an array, try to parse it
      try {
        const parsedImages = typeof req.body.images === "string" 
          ? JSON.parse(req.body.images) 
          : req.body.images;
        if (Array.isArray(parsedImages)) {
          updateFields.images = parsedImages
            .filter(img => img && img.url && img.url.trim() !== "")
            .map(img => ({
              url: img.url.trim(),
              altText: img.altText || "",
            }));
        }
      } catch (e) {
        console.error("Error parsing images:", e);
      }
    }

    // Backward compatibility: Handle single image field
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

// Images array fields
if (JSON.stringify(currentProduct.images || []) !== JSON.stringify(updatedProduct.images || [])) {
  modifiedFields.push(`images: ${(currentProduct.images || []).length} -> ${(updatedProduct.images || []).length} images`);
}

// Image fields (backward compatibility)
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
