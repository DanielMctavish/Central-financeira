const mongoose = require("mongoose");

const userDadosSchema = new mongoose.Schema({
    dividaAuth: Boolean,
    dividaValor: Number,
    dividaBank: String
})

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    CPF: Number,
    password: String,
    saldo: Number,
    dadosFinanceiros: userDadosSchema
})

module.exports = mongoose.model("Usuarios", userSchema)