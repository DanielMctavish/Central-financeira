require('../app')
const express = require('express')
const routerBanks = express.Router()
const banks = [
    {
        nome: "banco maximus",
        saldo: 250500400,
        credito: 5000,
        jurospercent: 0.15
    },
    {
        nome: "banco geeksme",
        saldo: 350500400,
        credito: 12000,
        jurospercent: 0.20
    },
    {
        nome: "banco imperius",
        saldo: 750500400,
        credito: 20400,
        jurospercent: 0.35
    }
]

const usuarios = require("../models/usuarios.model")


//PAGINA INICIAL DOS BANCOS--------------------------------------------------
routerBanks.get("/", (req, res) => {
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }
    res.render("pages/bancos")
})

// BANCO MAXIMUS---------------------------------------------------------

routerBanks.get("/maximusbank", async (req, res) => {
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }

    let userId = req.session.userId
    let usuarioAtual = await usuarios.findOne({ _id: userId })
    let dividaUser = usuarioAtual.dadosFinanceiros.dividaValor

    //res.json({ banco: `BANCO MAXIMUS - Logado como: ${usuarioAtual.name}`, userId: userId })
    req.session.maximusCred = banks[0].credito - dividaUser

    if (req.session.maximusCred < 1) {
        req.session.maximusCred = 0;
    }

    res.render("pages/maximus", {
        nome: usuarioAtual.name,
        cpf: usuarioAtual.CPF,
        credito: parseFloat(req.session.maximusCred).toFixed(2),
        saldo: usuarioAtual.saldo
    })
})


routerBanks.post("/maximusbank/emprestimo", async (req, res) => {//PEDIDO DE EMPRÉSTIMO------------
    if (!req.session.loginAutenticate) {//verificando sessão!
        return res.send("você não está logado, redirecionando para o HOME")
    }



    let userId = req.session.userId
    let usuarioAtual = await usuarios.findOne({ _id: userId })
    let saldoUser = usuarioAtual.saldo;
    let dividaUser = usuarioAtual.dadosFinanceiros.dividaValor;
    let emprest = parseInt(req.body.emprestValue)
    let emprestJuros = emprest * 0.15
    let dividaComJuros = emprest + emprestJuros;

    console.log("valor dos juros", emprestJuros)
    if (emprest < 0 || emprest == null || !emprest) {
        return res.render("pages/maximus", {
            msgInvalid: true
        })
    }

    if (emprest >= banks[0].credito - dividaUser) {
        return res.render("pages/maximus", {
            msgInvalid2: true
        })
    }


    try {
        await usuarios.findOneAndUpdate({ _id: usuarioAtual._id }, {
            saldo: saldoUser += emprest,
            dadosFinanceiros: {
                dividaAuth: true,
                dividaValor: dividaUser += dividaComJuros,
                dividaBank: "BANCO MAXIMUS"
            }
        }, { new: true })

        return res.redirect("/banks/maximusbank")
    } catch (error) {

        res.json({
            msg: "houve um erro ao tentar pedir o empréstimo",
            error: error
        })

    }


})

//QUITAR Dívida de empréstimo total--------------------------------------

routerBanks.get("/maximusbank/quitemprest", async (req, res) => {
    let userId = req.session.userId
    let usuarioAtual = await usuarios.findOne({ _id: userId })
    let dividaUser = usuarioAtual.dadosFinanceiros.dividaValor;

    if(dividaUser > usuarioAtual.saldo){
        return res.send("você não tem saldo suficiente para quitar esta dívida")
    }

    if (usuarioAtual.dadosFinanceiros.dividaAuth == true) {
        await usuarios.findOneAndUpdate({ _id: userId }, {
            saldo: usuarioAtual.saldo - dividaUser ,
            dadosFinanceiros: {
                dividaAuth: false,
                dividaValor: 0,
                dividaBank: ""
            }
        })
    }

    res.redirect("/cliente")
})



//PAGANDO EMPRÉSTIMO!-----------PAY EMPREST--------------------------------

routerBanks.post("/maximusbank/payemprest", async (req, res) => {
    if (!req.session.loginAutenticate) {//verificando sessão!
        return res.redirect("/")
    }

    let userId = req.session.userId
    let usuarioAtual = await usuarios.findOne({ _id: userId })
    let saldoUser = usuarioAtual.saldo;
    let dividaUser = usuarioAtual.dadosFinanceiros.dividaValor;
    let payValue = req.body.payValue;

    if (usuarioAtual.dadosFinanceiros.dividaValor == 0) {
        await usuarios.findOneAndUpdate({ _id: usuarioAtual._id }, {
            dadosFinanceiros: {
                dividaAuth: false,
                dividaBank: ""
            }
        })
        return res.send("você não possue dívidas")
    }

    if (payValue <= 0 || payValue == undefined || payValue == null) {//verificação - 01
        return res.render("pages/cliente", {
            msgStatus: "valor inválido",
            authDivida: true,
            name: usuarioAtual.name,
            CPF: usuarioAtual.CPF,
            email: usuarioAtual.email,
            saldo: usuarioAtual.saldo
        })
    }

    if (payValue > dividaUser) {  //verificação - 02
        return res.render("pages/cliente", {
            msgStatus: "valor excede sua dívida",
            authDivida: true,
            name: usuarioAtual.name,
            CPF: usuarioAtual.CPF,
            email: usuarioAtual.email,
            saldo: usuarioAtual.saldo
        })
    }

    if (payValue > saldoUser) { //verificação - 03
        return res.render("pages/cliente", {
            msgStatus: "você não tem saldo suficiente para realizar o pagamento",
            authDivida: true,
            name: usuarioAtual.name,
            CPF: usuarioAtual.CPF,
            email: usuarioAtual.email,
            saldo: usuarioAtual.saldo
        })
    }



    try {
        await usuarios.findOneAndUpdate({ _id: usuarioAtual._id }, {
            saldo: saldoUser - payValue,
            dadosFinanceiros: {
                dividaAuth: true,
                dividaValor: dividaUser - payValue,
                dividaBank: "BANCO MAXIMUS"
            }
        }, { new: true })

        //res.send("pagamento realizado com sucesso")
        return res.redirect("/cliente")

    } catch (error) {
        return res.send("houve um erro ao tentar fazer o pagamento do empréstimo ", error)
    }


})



// BANCO GEEKSME---------------------------------------------------------
routerBanks.get("/geeksmebank", async (req, res) => {
    if (!req.session.loginAutenticate) {
        return res.send("você não está logado, redirecionando para o HOME")
    }
    res.send("BANCO GEEKSME")
})

// BANCO IMPERIUS---------------------------------------------------------

routerBanks.get("/imperiusbank", (req, res) => {
    if (!req.session.loginAutenticate) {
        return res.send("você não está logado, redirecionando para o HOME")
    }
    res.send("BANCO IMPERIUS")
})





module.exports = routerBanks