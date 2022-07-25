require('../app')
const express = require('express')
const routerShops = express.Router()
const lojas = require("../models/loja.model")
const multer = require("multer")
const fs = require("fs")
const produtos = require("../models/produtos.model")
const usuarios = require("../models/usuarios.model")
const inventario = require("../models/inventario")

//pagina inicial - criação de loja----------------------------------------------------------------
routerShops.get("/", async (req, res) => {
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }

    //pesquisar se o usuário já tem loja cadastrada..................
    let lojaSearch = await lojas.findOne({ _id: req.session.userId })
    let yourProducts = await produtos.find({ lojaId: req.session.userId })

    if (lojaSearch) {
        return res.render("pages/lojas/pessoalShop", {
            yourshopname: lojaSearch.nameshop,
            yourProducts: yourProducts
        })
    }



    //caso o usuário logado não possua uma loja:
    res.render("pages/lojas/shopCreate")
})


routerShops.post("/set", async (req, res) => { //CRIANDO UMA LOJA NOVA-----------------------------
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }


    try {
        let lojaAtual = await lojas.create({
            _id: req.session.userId,
            _idDono: req.session.userId,
            nameshop: req.body.nameshop,
            descricao: req.body.descricao
        })
        return res.render("pages/lojas/pessoalShop", {

        })


    } catch (error) {
        console.log(error.message);
        return res.send("houve algum erro ao tentar cadastrar sua loja")
    }
})



//rota cadastro de PRODUTOS-------------------------------------------------------------------
routerShops.post("/cadprodutos", async (req, res) => {

    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }


    //---<<MULTER>>--CONFIGURAÇÃO E UPLOAD DE IMAGEM!----------
    const Storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/images')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname)
        }
    })



    const upload = multer({
        storage: Storage
    }).single("photoUpload")
    //--------------------------------------------------------

    //resize....
    const resizePhoto = require("../midlewares/resize.images")//lembrar de adicionar "resize+" no front-end

    try {
        upload(req, res, (err) => {
            const nomeProduto = req.body.name;
            const quantProduto = req.body.quantidade;
            const valorProduto = req.body.valor;

            if (quantProduto > 10) {
                return res.render("pages/lojas/dashboardprodutos", {
                    quantAlert: true
                })
            }

            if (isNaN(quantProduto) || isNaN(valorProduto)) {
                return res.render("pages/lojas/dashboardprodutos", {
                    msgNaN: true
                })
            }

            if (err) {
                console.log("houve um erro ao tentar subir a imagem")
            }

            if (!req.file) {
                return res.render("pages/lojas/dashboardprodutos", {
                    msgFileNull: true
                })
            } else {
                req.session.photoUpload = req.file.filename;
            }

            setDatabase(nomeProduto, quantProduto, valorProduto, req.session.photoUpload)

        });
    } catch (error) {
        return res.send(error.message)
    }


    async function setDatabase(value1, value2, value3, value4) {
        let userAtual = await usuarios.findOne({ _id: req.session.userId })
        try {
            await produtos.create({
                lojaId: req.session.userId,
                donoName: userAtual.name,
                name: value1,
                quantidade: value2,
                valor: value3,
                image: {
                    data: value4
                }
            })
            resizePhoto(req.session.photoUpload);



            return res.redirect("/shops")

        } catch (error) {
            return res.send(`houve um erro ao tentar salvar produto: ${error}`)
        }
    }



})

//Dashboard de criação de produtos-------------------------------------------------
routerShops.get("/dahsboardprodutos", (req, res) => {
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }
    res.render("pages/lojas/dashboardprodutos")
})



//DASHBOARD DE TODAS AS LOJAS-------------------------------------------------------

routerShops.get("/dashboard", async (req, res) => {
    let produtosList = await produtos.find();
    let usuarioAtual = await usuarios.findOne({ _id: req.session.userId })

    if (req.session.loginAutenticate) {
        return res.render("pages/lojas/dashboard", {
            loginVerify: true,
            produtos: produtosList,
            user: usuarioAtual.name,
            userSaldo: usuarioAtual.saldo
        })
    } else {
        return res.render("pages/lojas/dashboard", {
            loginVerify: false,
            produtos: produtosList,
        })
    }

})

//EXCLUINDO PRODUTOS DA LOJA-------------------------------------------------------

routerShops.get("/deleteproduct/:id", async (req, res) => {
    if (!req.session.loginAutenticate) {
        return res.redirect("/")
    }

    let idProduct = req.params.id
    let produtoSelecionado = await produtos.findOne({ _id: idProduct })

    try {
        fs.unlinkSync(`./public/images/resize+${produtoSelecionado.image.data}`)
    } catch (error) {
        console.log("houve um erro ao tentar excluir a imagem original do servidor", error)
    }

    await produtos.deleteOne({ _id: produtoSelecionado._id })
    return res.redirect("/shops")

})

//ROTA DE COMPRA DE PRODUTO-------------------------
routerShops.get("/buy/:idproduct", async (req, res) => {
    if (!req.session.loginAutenticate) {
        let produtosList = await produtos.find();
        return res.render("pages/lojas/dashboard", {
            msglogin: true,
            produtos: produtosList
        })
    }

    let produtoAtual = await produtos.findOne({ _id: req.params.idproduct })
    let usuarioAtual = await usuarios.findOne({ _id: req.session.userId })
    let donoDaLoja = await usuarios.findOne({ _id: produtoAtual.lojaId })

    if (produtoAtual.lojaId == req.session.userId) {
        return res.send("você não pode comprar seu próprio ítem")
    }

    if (usuarioAtual.saldo < produtoAtual.valor) {
        let produtosList = await produtos.find();

        return res.render("pages/lojas/dashboard", {
            saldoLow: true,
            produtos: produtosList
        })
    }

    try {
        await inventario.create({
            _idDono: req.session.userId,
            nameItem: produtoAtual.name,
            valorItem: produtoAtual.valor,
            urlItem: produtoAtual.image.data
        })

        await usuarios.findOneAndUpdate({ _id: req.session.userId }, {//SUBTRAINDO SALDO DO CONTADOR
            saldo: usuarioAtual.saldo - produtoAtual.valor
        })

        await usuarios.findOneAndUpdate({ _id: donoDaLoja._id }, {//Adicionando valor do produto ao Dono da loja
            saldo: donoDaLoja.saldo + produtoAtual.valor
        })


        await produtos.findOneAndUpdate({ _id: produtoAtual._id }, {//DIMINUINDO QUANTIDADE DOS PRODUTOS
            quantidade: produtoAtual.quantidade - 1
        })

        if (produtoAtual.quantidade <= 1) {
            await produtos.findOneAndDelete({ _id: produtoAtual._id })
        }

        res.redirect("/shops/dashboard")
    } catch (error) {
        res.send(`houve um erro ao tentar realizar a comprar do ítem, erro: ${error.message}`)
    }
})


module.exports = routerShops;