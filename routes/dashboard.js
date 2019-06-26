/* -------------- MODULO DE FUNÇÕES DO PAINEL DO ADM ----------------*/

const express = require('express');
const router = express.Router();
const passport = require('passport');
const db = require('../config/BD');
var historicoAluguelBikes = [];
var nomeEstacoes;

/* --------Rota Inicial - /painel ------------*/
router.get('/', (req, res, next) => {
    if(req.session.loggedin){

        let userId = req.session.cpf;       // Id do Usuario
        let aluguelBike = 0;
        let numBikesAlugadas = 0;
        let precoPlano = 0;
        let nPlano = '';
        /* Zera Historico */
        historicoAluguelBikes = [];

        /* Zera nome Estacoes */
        nomeEstacoes = [];


        /*-------Query bike Alugada-------------- */
        db.connection.query('SELECT COUNT(*) aluguelBike FROM alugabike WHERE cpfAtual=? AND dataHoraDevolucao IS NULL', userId,
        (err, results, fields) => {
            if(err){
                console.log('------ERRO QUERY CHARTS - PAINEL -------')
                console.log(err);
            }else{
                aluguelBike = results[0].aluguelBike;
            }
        });

        /* --------Query numBike Alugada-------- */
        db.connection.query('SELECT COUNT(*) nBikes FROM alugabike WHERE cpfAtual=?', userId, (err, results, fields) => {
            if(err){
                console.log('------ERRO QUERY numBikeAlugadas - Charts ----------');
                console.log(err);
            }else{
                numBikesAlugadas = results[0].nBikes;
            }
        });

        /* --------Query Preco Plano ---------------*/
        db.connection.query('SELECT preco FROM usuario , plano WHERE usuario.CPF=? AND plano.idPlano=usuario.plano', userId,
        (err, results, fields) => {
            if(err){
                console.log('---------ERRO NA QUERY preco do Plano ----------');
                console.log(err);
            }else{
                precoPlano = results[0].preco;
            }
        });

        /* --------Query nome do plano do Cliente------ */
        db.connection.query('SELECT nomePlano FROM plano, usuario WHERE usuario.CPF=? AND plano.idPlano=usuario.plano', userId,
        (err, results, fields) => {
            if (err) {
                console.log('----ERRO AO BUSCAR NOME DO PLANO DO CLIENTE------');
                console.log(err);
            } else {
                nPlano = results[0].nomePlano;
            }   
        });

        /*-----------Query Historico------- */
        db.connection.query('SELECT idBike, dataHoraAluguel, dataHoraDevolucao FROM alugabike WHERE cpfAtual=?', userId ,(err, results, fields) => {
            if(err){
                console.log(err);
                res.sendStatus(500);
            }else{
                
                if(results.length > 0){
                    results.forEach(element => {
                        historicoAluguelBikes.push(element);
                    });
                }
                /* -----------Query Procura nome das Estacoes---------- */
                db.connection.query('SELECT nomeEstacao FROM estacao',(err, results, fields) => {
                    if(err){
                        console.log(err);
                    }else{
                        results.forEach(element => {
                            nomeEstacoes.push(element);
                        });
               
                        res.render('painel', {
                            userName: 'Olá, ' + req.session.username,
                            historico: historicoAluguelBikes,
                            nEstacao: nomeEstacoes,
                            bikeAlugada: aluguelBike,
                            numBikesAlugadas: numBikesAlugadas,
                            precoPlano: 'R$ '+ precoPlano+',00',
                            nomePlano: nPlano
                        });
                    }
                });
            }

        });

    }else{
        res.sendStatus(401);
    }
})

/* ------- Altera Config do Usuário -----------*/
router.get('/config', (req, res, next) => {
    let userId = req.session.cpf;
    let nomePlanos = [];
    if(userId){

        db.connection.query('SELECT nomePlano, idPlano FROM plano', (err, results, fields) => {
            if (err) {
                console.log(err);
            } else {
                results.forEach((element) => {
                    nomePlanos.push(element);
                    console.log(element)
                })
                res.render('painelConfig', {
                    userName: 'Olá, ' + req.session.username,
                    nPlanos: nomePlanos
                });
            }
        });

    }else{
        res.sendStatus(401);
    }

});

/*--------Procura Bikes Disponiveis------------*/
router.get('/config/bikeDisponivel', (req, res, next) => {
    let nomeEstacao = req.query.nomeEstacao;
    let numBikes;

    if (nomeEstacao) {
        db.connection.query('SELECT COUNT(*) AS Total_Bike FROM bike AS B, estacao AS E WHERE E.nomeEstacao= ? AND E.codEstacao=B.idEstacao and B.alugada=0', 
            [nomeEstacao], function(err, results, fields) {
                if(err){
                    console.log('----------Erro ao Buscar Bikes Disponiveis-------------');
                    console.log(err);
                }else{
                    numBikes = results[0].Total_Bike;
                    res.send('' + numBikes,);
                }
        });
    }


});

/*--------Faz o logout do usuario-------------*/
router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if(err){
            console.log('-------------Erro no Logout----------');
            console.log(err);
        }
        console.log('Logout do Usuário');
        res.redirect('/login');
    })
});

/*--------Alterar Cartao de Credito-----------*/
router.post('/editcreditcard', (req, res, next) => {
    let userId = req.session.cpf;
    let cartao = req.body.cartaoDeCredito;

    if(userId && cartao){
        db.connection.query('UPDATE usuario SET cartaoDeCredito=? WHERE CPF=?', [cartao,userId], function(err, results, fields) {
            if (err) {
                console.log('--------Erro na Atualização do Cartão de Crédito---------');
                console.log(err);
            } else {
                console.log('Query executada - Atualizar cartao de Credito');
                res.sendStatus(200);
            }
        });
    }else{
        console.log('Falha ao editar cartao de crédito');
        console.log('Erro com os dados: usuario: ' + userId + ' --  cartao: ' + cartao);
        res.send('Usuário não autenticado');
    }
});

/* ----Busca o numero do cartao de crédito-----*/
router.get('/numcartaodecredito', (req, res, next) => {

    let userId = req.session.cpf;

    if(userId){
        db.connection.query('SELECT cartaoDeCredito FROM usuario WHERE CPF = ? ', userId , function(err, results, fields) {
            
            if(err){
                console.log('------Erro em buscar cartao de crédito--------');
                console.log(err);
            }else{
                console.log('Query Executada - Buscar Cartao de Credito');
                res.send(results[0].cartaoDeCredito);
            }
        });
    }else{
        res.send('Usuário não Autenticado');
    }

});

/* -------------------Alugar Bike---------------- */
router.post('/alugarbike', (req, res, next) => {
    let qtdBike = req.body.numBikesDisponiveis;
    let nomeEstacao = req.body.nomeEstacao;
    let cpfID = req.session.cpf;
    console.log(qtdBike + ' & ' + nomeEstacao + '&' + cpfID);

    /* TODO - FAZER A VERIFICACAO DE PLANO E CARTAO */

    if (cpfID && qtdBike > 0) {

        db.connection.query('SELECT COUNT(*) bikeAlugada FROM alugabike WHERE cpfAtual=? AND dataHoraDevolucao IS NULL', cpfID, 
        (err, results, fields) => {
            if (err) {
                console.log('--------Erro em buscar qtd de bike alugada--------');
                console.log(err);
            } else {
                let bikeAlugada = results[0].bikeAlugada;

                if (!bikeAlugada) {
                    db.connection.query('SELECT idBike FROM bike AS B, estacao AS E WHERE E.nomeEstacao=? AND B.idEstacao=E.codEstacao AND B.alugada=0 LIMIT 1', [nomeEstacao], function (err, results, fields) {
                        if(err){
                            console.log('-------------Falha ao Alugar Bike - Buscar idBike-------------');
                            console.log(err);
                            res.status(500).send({msg: 'Falha no Servidor'});
                        }else{
                            let idBicicleta = results[0].idBike;
                            //console.log(codEstacao);
                            let date = new Date();
                            let horaDeAluguel = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                            console.log('HORA ALUGUEL: '+ horaDeAluguel);
                            db.connection.query('INSERT INTO alugabike SET idBike=?, dataHoraAluguel=?, cpfAtual=?', [idBicicleta, horaDeAluguel, cpfID],
                            function (err, results, fiels) {
                                if (err) {
                                    console.log('-----------Falha ao Alugar Bicicleta - Inserir aluguel------------');
                                    console.log(err);
                                    res.send(500, {msg: 'Falha no Servidor'});
                                }else{
                                    console.log('Alugou - Objeto: ' + results);
                                    db.connection.query('UPDATE bike SET alugada=1 WHERE idBike=?', [idBicicleta], (err, results, fields) =>{
                                        if (err) {
                                            console.log('----------Falha - Alugar Bike - Atualizar Bike -> alugada=1------------');
                                            console.log(err);
                                            res.send({msg: 'Falha no Servidor'}).sendStatus(500);
                                        } else {
                                            res.send({msg: 'Bicicleta Alugada'});
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    res.send({msg: 'Você já tem ' + bikeAlugada + ' bicicleta alugada!'});
                }
            }
        });


    } else {
        res.send({msg: 'Por Favor, Selecione uma estação com bicicletas disponíveis'});
    }
});

/*------------------Devolve a Bike ---------------*/
router.post('/devolverbike', (req, res, next) => {

    let cpfId = req.session.cpf;
    let date = new Date();
    let horaDevolucao = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

    if(cpfId){
        db.connection.query('SELECT idBike FROM (SELECT * FROM alugabike WHERE cpfAtual=? AND dataHoraDevolucao IS NULL) AS tab_bike',
        cpfId, (err, results, fields)=>{

            if(err){
                console.log('----------ERRO DEVOLUCAO BIKE - Buscar bikes alugadas ---------');
                console.log(err);
                res.send({msgDevolucao: 'Erro ao Devolver!'});
            }else{
                results.forEach(element=>{
                   db.connection.query('UPDATE alugabike SET dataHoraDevolucao=? WHERE dataHoraDevolucao IS NULL AND idbike=?',[horaDevolucao,element.idBike],
                   (err,results,fields) =>{
                        if (err) {
                            console.log('-----ERRO DEVOLUCAO BIKE - Atualizar alugabike -------');
                            console.log(err);
                            res.send({msgDevolucao: 'Erro ao Devolver!'});
                        } else {
                            db.connection.query('UPDATE bike SET alugada=0 WHERE idbike=?', element.idBike, (err, results, fields) =>{
                                res.send({msgDevolucao: 'Bicicleta devolvida com Sucesso!'});
                            });
                        }
                   })
                })
            }

        });
    }else{
        res.sendStatus(401);
    }

});

/*----------------Alterar Plano----------------- */
router.post('/alterarplano', (req, res, next) => {
    let userId = req.session.cpf;
    let planoID = req.body.plano;

    if(userId && planoID){
        db.connection.query('update usuario set plano=? where CPF=?', [planoID,userId],
        (err, results, fields) => {
            if(err){
                console.log(err);
                res.sendStatus(500);
            }else{
                res.send({msgPlano: 'Atualizado com Êxito!'});
            }
        });

    }else{
        res.send({msgPlano: 'Não foi possível alterar!'});
    }

});

module.exports = router;