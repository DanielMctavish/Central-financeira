const express = require("express")
const app = express();
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const session = require('express-session');
const mongoose = require("mongoose")
const flash = require("connect-flash")


//conexão com o banco de dados--------------------------------
mongoose.connect("mongodb+srv://danielarruda:1234@cluster0.via0dqi.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser: true,
    useUnifiedTopology:true,
})

const db = mongoose.connection;
db.on("error",(error)=>{
    console.log(error)
})
db.once("open",()=>{
    console.log("conectado ao banco de dados")
})
//session config-----------------------------------------------
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}))


//arquivos estáticos............................................
app.use('/public', express.static("public"));


//handlebars config---------------------------------------------
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', 'handlebars');



//bodyPArser config--------------------------------------------------
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



//ROTAS..........................................................
const routergeral = require("./routers/routerGeral")
const routerLogin = require("./routers/routerLogin")
const routerCliente = require("./routers/routerCliente")
const routerTransfer = require("./routers/routerTransfer")
const routerBanks = require("./routers/routerBanks")
const routerDeleteUser = require("./routers/routerDeleteUser")
const routerShops = require("./routers/routerShops")
const routerInventario = require("./routers/routerInventario")

app.use("/", routergeral);
app.use("/login", routerLogin);
app.use("/cliente", routerCliente)
app.use("/transferencia", routerTransfer)
app.use("/banks", routerBanks)
app.use("/deleteuser", routerDeleteUser)
app.use("/shops", routerShops)
app.use("/inventario", routerInventario)


//----ROTA DE TESTES---------------------------------------------
const routerTest = require("./routers/routerTest")
app.use("/teste", routerTest)



//----------------------------------------------------------------------
const PORT = process.env.PORT || 9779;
app.listen(PORT, () => {
    console.log("aplicativo conectado na porta ", PORT);
})