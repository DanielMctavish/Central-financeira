
let faixaBoard = document.getElementById("faixa-sup")

console.log("script rodando");
setInterval(() => {
    setTimeout(() => {
        faixaBoard.style.background = "white"
        faixaBoard.style.boxShadow = "white"
        setTimeout(() => {
            faixaBoard.style.background = "rgb(56, 179, 255)"
            faixaBoard.style.boxShadow = "0px 5px 10px 0px rgb(56, 179, 255)"
            setTimeout(() => {
                faixaBoard.style.background = "rgb(128, 0, 163)"
                faixaBoard.style.boxShadow = "0px 5px 10px 0px rgb(128, 0, 163)"
                setTimeout(() => {
                    faixaBoard.style.background = "rgb(255, 67, 20)"
                    faixaBoard.style.boxShadow = "0px 5px 10px 0px rgb(255, 67, 20)"
                    setTimeout(() => {
                        faixaBoard.style.background = "white"
                        faixaBoard.style.boxShadow = "0px 5px 10px 0px white"
                    }, 5000)
                }, 5000)
            }, 3000)
        }, 2000)
    }, 3000)
}, 2500);