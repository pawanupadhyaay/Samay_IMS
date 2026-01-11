const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",  // Reference to the Product model
    required: true
  },
  sku: {
    type: String, 
    required: true
  },
  modifiedBy: {
    type: String, 
    required: true
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
    default: Date.now
  },
});

const History = mongoose.model('History', HistorySchema);

module.exports = History;
