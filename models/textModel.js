const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const dataSchema = Schema({
    url: String,
    youtube: String,
    title: String,
    text: String,
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    created: { 
        type: Date,
        default: Date.now
    }
})

const Data = mongoose.model('Text', dataSchema);

module.exports = Data;