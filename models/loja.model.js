const mongoose = require("mongoose");


const lojaSchema = new mongoose.Schema({
    _id: String,
    _idDono: String,
    nameshop: String,
    descricao: String
})

module.exports = mongoose.model("lojas", lojaSchema)