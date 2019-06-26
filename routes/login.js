const express = require('express');
const router = express.Router();
const db = require('../config/BD');
const passport = require('passport');
var erros = [];

/* ------Renderiza a Pagina de Login-- /login ----- */
router.get('/', (req, res , next) => {
    res.render('login', {
        erros
    });
    erros = [];
});

/* -------POST para Autenticação do Usuário----- */
router.post('/',(req, res, next) => {
    let userCpf = RetiraMascara(req.body.CPF);
    let userPwd = req.body.senha;
    let session = req.session;

    if(userCpf && userPwd){
        db.connection.query('SELECT * FROM usuario WHERE CPF = ? AND senha = ?',[userCpf, userPwd], function(err, results, fields) {
           if(err){
                console.log(err);
            }else{
                if(results.length > 0){
                    session.loggedin = true;
                    session.username = results[0].nome;
                    session.cpf = results[0].CPF;
                    res.redirect('/painel');
                }else{
                    erros.push({msg: 'Usuário ou senha incorretos'});
                    res.redirect('/login');
                }
            }
        });
           
    }else{
        erros.push({msg: 'Entre com o usuário e senha'});
        res.redirect('/login');
    }
})

function RetiraMascara(ObjCPF) {
    return ObjCPF.replace(/\D/g, '');
}
module.exports = router;