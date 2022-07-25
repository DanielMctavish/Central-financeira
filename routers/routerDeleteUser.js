require('../app')
const express = require('express')
const routerDeleteUser = express.Router()
const usuarios = require("../models/usuarios.model")
const inventario = require("../models/inventario")
const produtos = require("../models/produtos.model")
const lojas = require("../models/loja.model")


routerDeleteUser.get("/", async (req, res) => {
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }
    return res.render("pages/cliente", {
        deleteMsg: true
    })
})

routerDeleteUser.post("/send", async (req, res) => {
    let buttons = req.body.confirmBtn;
    if (buttons == "cancelar") {
        return res.redirect("/")
    }
    let usuarioIdAtual = req.session.userId;
    if (buttons == "prosseguir") {
        await lojas.deleteMany({_idDono:usuarioIdAtual})
        await inventario.deleteMany({_idDono:usuarioIdAtual})
        await produtos.deleteMany({lojaId:usuarioIdAtual})
        await usuarios.findOneAndDelete({ _id: usuarioIdAtual })
        req.session.destroy()
        res.redirect("/")
        return;
    }
})






module.exports = routerDeleteUser;