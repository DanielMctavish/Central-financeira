require('../app')
const express = require('express')
const routerTransfer = express.Router()
const usuarios = require("../models/usuarios.model")




routerTransfer.get("/", (req, res) => {//ROTA INICIAL - TRANSFERENCIA
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }
    res.render("pages/transferencia")
})

routerTransfer.post("/search", async (req, res) => {//PROCURANDO EMAIL PRA FAZER A TRANSFERÊNCIA
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }

    let usuarioAtual = await usuarios.findOne({ _id: req.session.userId })
    if (usuarioAtual.email == req.body.userEmailSearch) {
        return res.render("pages/transferencia", {
            emailEqual: true
        })
    }


    if (!req.body.userEmailSearch || req.body.userEmailSearch == null || req.body.userEmailSearch.length < 5) {
        return res.render("pages/transferencia", {
            emailNull: true
        })
    }


    let searchUser = await usuarios.findOne({ email: req.body.userEmailSearch })
    req.session.searchUser = searchUser;
    if (!searchUser) {
        return res.render("pages/transferencia", {
            emailOff: true
        })
    }

    res.render("pages/transferencia", {
        nomefind: searchUser.name,
        cpfFind: searchUser.CPF,
        authSearch: true
    })

})

routerTransfer.post("/set", async (req, res) => {//EXECUTANDO A TRANSFERENCIA--------------------
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }
    if (!req.session.searchUser) {
        return res.send("não foi possível fazer a transferência, nenhum usuário foi pesquisado!")
    }

    let userAtual = await usuarios.findOne({ _id: req.session.userId })
    let searchUser = req.session.searchUser;
    const transferValue = req.body.transferValue;


    if (transferValue <= 0 || transferValue == null) {
        return res.send("valor inválido!")
    }
    if (transferValue > userAtual.saldo) {
        return res.send("atenção! você não tem saldo suficiente para realizar esta transferência")
    }
    if (userAtual.dadosFinanceiros.dividaAuth == true) {
        return res.send("atenção! você não pode fazer uma transferência com uma dívida pendente")
    }

    const updateSaldo = searchUser.saldo += parseInt(transferValue);
    const updateSaldoUserAtual = userAtual.saldo -= parseInt(transferValue);

    try {
        await usuarios.findOneAndUpdate({ _id: searchUser._id }, {
            saldo: updateSaldo
        }, { new: true })

        await usuarios.findOneAndUpdate({ _id: userAtual._id }, {
            saldo: updateSaldoUserAtual
        }, { new: true })


        return res.send("transferência realizada com sucesso")
    } catch (error) {
        return res.send("houve algum erro ao tentar executar a transferência")
    }

})

//Listando todos os usuários - "/transferencia/searchAll"---
//----------------------------------------------------------
routerTransfer.get("/searchAll", async (req, res) => {
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }
    let userList = await usuarios.find()
    res.render("pages/transferencia",{
        listAuth: true,
        userList: userList
    })
})


module.exports = routerTransfer;