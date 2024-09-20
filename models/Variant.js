const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true },
  files: [{ type: String }] // Array of file URLs
});

const Variant = mongoose.model('Variant', variantSchema);

module.exports = Variant;
