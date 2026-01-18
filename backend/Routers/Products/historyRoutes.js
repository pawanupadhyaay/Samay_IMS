const express = require("express");
const router = express.Router();
const History = require("../../DB/history");  // Adjust path if needed

// Fetch the product modification history
router.get("/", async (req, res) => {
  try {
    // Limit to last 5000 records for performance (adjust as needed)
    // Most recent records first, with index on timestamp this will be fast
    const limit = parseInt(req.query.limit) || 5000; // Default 5000, max 10000
    
    const historyData = await History.find()
      .populate("product", "brand sku category inventory price") // Only populate needed fields
      .sort({ timestamp: -1 }) // Use indexed field for fast sorting
      .limit(Math.min(limit, 10000)) // Cap at 10000 for safety
      .lean(); // Faster - returns plain JavaScript objects

    if (!historyData || historyData.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    return res.status(200).json({ success: true, data: historyData });
  } catch (error) {
    console.error("❌ Error fetching modification history:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;
