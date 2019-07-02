const express = require('express');
const router = express.Router();
const db = require('../config/BD');
var nomeEstacoes;

router.get('/', (req, res, next) => {

    /* Zera nome Estacoes */
    nomeEstacoes = [];

    /* -- Procura as estaçoes disponiveis -- */
    db.connection.query('SELECT nomeEstacao FROM estacao',(err, results, fields) => {
        if(err){
            console.log(err);
        }else{
            results.forEach(element => {
                nomeEstacoes.push(element);
            });
   
            res.render('cadastraBike', {
                nEstacao: nomeEstacoes,
            });
        }
    });
});

router.post('/', (req, res, next) => {

    console.log(req.body);

    let numBikes = req.body.numBike;
    if(numBikes >= 1 && numBikes <= 10 && req.body.nomeEstacao){
        for (let index = 1; index <= numBikes; index++) {
            db.connection.query('INSERT INTO bike SET idEstacao=(SELECT codEstacao FROM estacao WHERE nomeEstacao=?)', req.body.nomeEstacao,  (err, results , fields) => {
                if(err){
                    console.log(err);
                    res.send('Erro: '+ err.message);
                }
            });  
        }
        res.send('Bike(s) cadastrada');
    }
});
module.exports = router;