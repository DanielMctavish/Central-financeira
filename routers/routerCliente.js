require('../app')
const express = require('express')
const routerCliente = express.Router()
const usuarios = require("../models/usuarios.model")
const produtos = require("../models/produtos.model")
const lojas = require("../models/loja.model")
const inventario = require("../models/inventario")



routerCliente.get("/", async (req, res) => {
    if (!req.session.loginAutenticate) {
        console.log("você não pode acessar a página de cliente, por favor faça login");
        return res.redirect("/")
    }

    let usuarioIdAtual = req.session.userId;
    let usuarioAtual = await usuarios.findOne({ _id: usuarioIdAtual })
    let lojaAtual = await lojas.findOne({ _idDono: usuarioIdAtual })

    if (lojaAtual) {
        req.session.lojapresence = true;
    } else {
        req.session.lojapresence = false;
    }

    let produtosCount = await produtos.find({lojaId:usuarioIdAtual}).count()
    let inventarioCount = await inventario.find({_idDono:usuarioIdAtual}).count()
    return res.render("pages/cliente", {
        name: usuarioAtual.name,
        email: usuarioAtual.email,
        CPF: usuarioAtual.CPF,
        saldo: usuarioAtual.saldo,
        authDivida: usuarioAtual.dadosFinanceiros.dividaAuth,
        dividaBank: usuarioAtual.dadosFinanceiros.dividaBank,
        dividaValue: parseFloat(usuarioAtual.dadosFinanceiros.dividaValor).toFixed(2),
        lojapresence: req.session.lojapresence,
        produtosCount: produtosCount,
        inventarioCount: inventarioCount
    })

})




module.exports = routerCliente