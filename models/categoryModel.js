const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const categorySchema = Schema({
    name: String,
    tag: String,
    active: {
		type: Boolean,
		default: false
	},
	created: { 
        type: Date,
        default: Date.now
    }
})

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;