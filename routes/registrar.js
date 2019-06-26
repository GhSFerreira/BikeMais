const express = require('express');
const router = express.Router();
const db = require('../config/BD');
const passport = require('passport');
var erros = [];

/* --------Renderiza a Pagina - /registrar ---*/
router.get('/', (req, res, next) => {

    let planoID = [];

    db.connection.query('SELECT nomePlano, idPlano FROM plano', (err, results, fields) => {
        if (err) {
            console.log(err);
        } else {
            results.forEach((element) => {
                planoID.push(element);
            })
            res.render('registrar', {
                erros,
                nPlanos: planoID
            });
        }
    });

    //Limpa Vetor de Mensagens
    erros = [];
});

/* ------Registra o Usuário no BD------- */
router.post('/', (req, res, next) => {

    let dataUser = req.body;
    dataUser.CPF = RetiraMascara(req.body.CPF);

    db.connection.query('INSERT INTO usuario SET ?', dataUser, function(err, results, fields) {
        if(err){           
            if(err.code == "ER_DUP_ENTRY"){
                console.log('Usuário já cadastrado!');
                erros.push({msg: 'Usuário já cadastrado'});
            }else{
                console.log(err);
            }
            erros.push({msg:'Erro ao Cadastrar'});
            res.redirect('/registrar')
        }else{
            console.log('Usuario Cadastrado!');
            req.session.loggedin = true;
            req.session.username = dataUser.nome;
            req.session.cpf = dataUser.CPF;
            res.redirect('/painel');
        }
        //response.json(results);
        console.log('Query executada');
    });
});

passport.serializeUser(function(user_id, done) {
    done(null, user_id);
  });
  
passport.deserializeUser(function(user_id, done) {
    done(null, user_id); 
  });

function RetiraMascara(ObjCPF) {
    return ObjCPF.replace(/\D/g, '');
}

module.exports = router;