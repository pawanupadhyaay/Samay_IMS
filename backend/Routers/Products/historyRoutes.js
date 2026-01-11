const express = require("express");
const router = express.Router();
const History = require("../../DB/history");  // Adjust path if needed

// Fetch the product modification history
router.get("/history", async (req, res) => {
  try {
    const historyData = await History.find()
      .populate("product", "brand sku category inventory price") // Ensure product field is populated correctly
      .sort({ timestamp: -1 });

    if (!historyData || historyData.length === 0) {
      return res.status(200).send({ message: "No modification history found." });
    }

    return res.status(200).json({ success: true, data: historyData });
  } catch (error) {
    console.error("Error fetching modification history:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
