const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
         type: String,
         required: true 
        },
    price: {
         type: Number,
         required: true 
        },
    description: {
         type: String 
        },
    imageUrl: { type: String },
    
    categoryId: {
        type: mongoose.Schema.Types.ObjectId, //Relationships
        ref: 'Category',
        required: true}
});
{Timestamp:true}

module.exports = mongoose.model('Product', ProductSchema);
