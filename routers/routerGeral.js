require('../app')
const express = require('express')
const routerGeral = express.Router()
const usuarios = require("../models/usuarios.model")



//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-



//ROTAS--------------------------------

routerGeral.get("/", async (req, res) => {//ROTA HOME--------------------------

    if (req.session.loginAutenticate) {
        return res.redirect("/cliente")
    }


    res.render("pages/home")
})



routerGeral.get("/cadastro", (req, res) => {//CADASTRO PAGE----------------
    res.render("pages/cadastro")
})


routerGeral.post("/cadastro/confirm", auth, async (req, res) => { //CADASTRO ROTA
    console.log("rota de cadastro");


    let useratual = await usuarios.findOne({ email: req.body.email });

    if (useratual) {
        return res.render("pages/cadastro",{
            userExistent: true
        })
    }


    criandoUsuario(req.body.name, req.body.email, req.body.CPF, req.body.pass)
    //CRIANDO USUÁRIO-------------------------------------------------

    async function criandoUsuario(name, email, cpf, pass) {
        req.session.atualname = name;
        try {
            const user = await usuarios.create({
                name: name,
                email: email,
                CPF: cpf,
                password: pass,
                saldo: 0,
                dadosFinanceiros: {
                    dividaAuth: false,
                    dividaValor: 0,
                    dividaBank: ""
                }
            })

            console.log("usuário ", user.name, " criado com sucesso");
            res.redirect("/createuser")
        } catch (error) {
            console.log(error.message);
            console.log("continuando programa!");
            res.redirect("/erroruser")
        }
    }
})

routerGeral.get("/createuser", (req, res) => { //usuário criado com sucesso!

    res.render("pages/pages-status/status", {
        createSuccess: true,
        username: req.session.atualname
    })
})

routerGeral.get("/erroruser", (req, res) => {//Erro ao tentar criar usuário!
    res.render("pages/pages-status/status", {
        createusererror: true
    })
})





async function auth(req, res, next) {
    let cpfUser = parseInt(req.body.CPF);

    if (!cpfUser) {
        res.render("pages/cadastro", {
            errorCpf: true
        })
        console.log("CPF inválido! permitido apenas números");
        return
    }


    if (cpfUser.toString().length < 11) {
        res.render("pages/cadastro", {
            errorCpf: true
        })
        console.log("CPF inválido! precisa conter mais de 11 caracterer");
        return
    }

    let cpfExist = await usuarios.findOne({ CPF: req.body.CPF });

    if (cpfExist) {
        return res.render("pages/cadastro", {
            existentCpf: true
        })
    }

    if (req.body.pass != req.body.pass02) {
        console.log("as senhas não conferem");
        res.render("pages/cadastro", {
            error01: true
        })
    } else if (req.body.pass.length < 6) {
        console.log("sua senha deve contem mais do que 6 caracter");
        res.redirect("/cadastro")
    } else if (!req.body.name || req.body.name.length < 4) {
        res.render("pages/cadastro", {
            errorName: true
        })
        return 0;
    } else {
        next();
    }

}



module.exports = routerGeral;