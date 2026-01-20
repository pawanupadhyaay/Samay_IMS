const express = require("express");
const router = express.Router();
const History = require("../../DB/history");  // Adjust path if needed

// Fetch the product modification history with pagination
router.get("/", async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Default 100 (reduced from 5000)
    const skip = (page - 1) * limit;
    const maxLimit = 500; // Maximum limit for safety

    const actualLimit = Math.min(limit, maxLimit);

    // Calculate total count for pagination metadata
    const totalCount = await History.countDocuments();
    
    // Fetch paginated history data
    const historyData = await History.find()
      .populate("product", "brand sku category inventory price") // Only populate needed fields
      .sort({ timestamp: -1 }) // Use indexed field for fast sorting
      .skip(skip)
      .limit(actualLimit)
      .lean(); // Faster - returns plain JavaScript objects

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / actualLimit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data: historyData || [],
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        limit: actualLimit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching modification history:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;
