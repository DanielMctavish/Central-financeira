require('../app')
const express = require('express')
const routerLogin = express.Router()
const usuarios = require("../models/usuarios.model")


routerLogin.get("/", (req, res) => { //ROTA LOGIN-------------------
    res.render("pages/login")
})

routerLogin.post("/authenticate", async (req, res) => {

    let user = await usuarios.findOne({ email: req.body.email });

    if (req.session.loginAutenticate) {
        return res.redirect("/cliente")
    }

    if (req.body.email == null) {
        return res.redirect("/login")
    }

    if (!user) {
        return res.render("pages/login", {
            userEmpty: true
        })
    }

    if (user.password == req.body.passwordLogin) {
        req.session.loginAutenticate = true;
        req.session.userId = user._id
        res.redirect("/cliente")
        //console.log("logado com sucesso ", user.name);
    } else {
        return res.render("pages/login", {
            userErr: true
        })
    }

})

//ROTA DESLOGANDO------------------------
routerLogin.get("/logoff", (req, res) => {
    req.session.destroy();
    res.render("pages/home", {
        msgdeslog: true
    })
})



module.exports = routerLogin;