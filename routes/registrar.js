const express = require('express');
const router = express.Router();
const db = require('../config/BD');
const passport = require('passport');
var erros = [];

/* --------Renderiza a Pagina - /registrar ---*/
router.get('/', (req, res, next) => {
    res.render('registrar', {
        erros
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
            console.log('Usuario Cadastrado!')
            db.connection.query('SELECT LAST_INSERT_ID() as user_id', function(err, results, fields) {
                if(err){
                    console.log(err);
                }else{
                    let user_id = results[0];
                    req.login(user_id, function (err) {
                        res.redirect('/painel');
                    });
                }
            });
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