const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",  // Reference to the Product model
    required: true,
    index: true  // Index for faster populate queries
  },
  sku: {
    type: String, 
    required: true,
    index: true  // Index for faster filtering
  },
  modifiedBy: {
    type: String, 
    required: true,
    index: true  // Index for faster filtering
  },
  modifiedFields: {
    type: [String],  // Array to store the modified fields
    required: true
  },
  action: {
    type: String,  // Action like 'create', 'update', 'delete'
    required: true
  },
  timestamp: {
    type: Date, 
    default: Date.now,
    index: true  // Index for faster sorting
  },
});

// Compound index for common query patterns
HistorySchema.index({ timestamp: -1, product: 1 });

const History = mongoose.model('History', HistorySchema);

module.exports = History;
