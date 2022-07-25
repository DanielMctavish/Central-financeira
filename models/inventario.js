const mongoose = require("mongoose");


const itemSchema = new mongoose.Schema({
    _idDono: String,
    nameItem: String,
    valorItem: Number,
    urlItem: String
})

module.exports = mongoose.model("inventario", itemSchema)