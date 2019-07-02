const express = require('express');
const router = express.Router();
const db = require('../config/BD');

router.get('/', (req, res, next) => {
    res.render('cadastraEstacao');
});

router.post('/', (req, res, next) => {
    let cep = req.body.cepEstacao;
    let nome = req.body.nomeEstacao;

    if(nome && cep){
        db.connection.query('INSERT INTO estacao SET nomeEstacao=?, cep=?', [nome,cep], (err, results, fields) => {
            if(err){
                console.log(err);
                res.send(err.message);
            }else{
                res.send('Estação Cadastrada');
            }
        });
    }
});
module.exports = router;