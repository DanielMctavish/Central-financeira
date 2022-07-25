const mongoose = require("mongoose");



const produtoSchema = new mongoose.Schema({
    lojaId:String,
    donoName:String,
    name: String,
    quantidade: Number,
    valor: Number,
    image: {
        data: String
    }
})

module.exports = mongoose.model("produtos", produtoSchema)