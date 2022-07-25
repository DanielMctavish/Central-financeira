require("../app")
const express = require('express')
const routerInventario = express.Router()
const usuarios = require("../models/usuarios.model")
const inventario = require("../models/inventario")

routerInventario.get("/",async (req,res)=>{
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }
    let itensUser = await inventario.find({_idDono:req.session.userId})
    let userAtual = await usuarios.findOne({_id:req.session.userId})

    res.render("pages/inventario",{
        itensUser:itensUser,
        userAtual: userAtual.name
    })
})






module.exports = routerInventario;