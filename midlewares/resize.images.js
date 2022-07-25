require('../app')
const sharp = require("sharp");
const fs = require("fs")

const resizeExec = async function resizeNow(imageUpload) {
    try {
        await sharp(`./public/images/${imageUpload}`).resize({
            width: 500,
            height: 500,
            fit: 'cover',
            position: 'center',
            background: { r: 255, g: 255, b: 255}
        }).toFile(`./public/images/resize+${imageUpload}`).then(() => {
           console.log("imagem recortada com sucesso!");
        })

    } catch (error) {
       console.log(error.message);
    }

    //excluíndo upload foto original----------------------------------------------
    const uploadOriginalPhoto = imageUpload;
    try {
        fs.unlinkSync(`./public/images/${uploadOriginalPhoto}`) 
        console.log("upload da foto original excluído!");
    } catch (error) {
        console.log("houve um erro ao tentar excluir upload da foto original");
        console.log(error.message);
    }


}

module.exports = resizeExec;