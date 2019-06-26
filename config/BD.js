const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'teste'

});


function execQuery(sqlQry, data, response) {    
    
    connection.query(sqlQry,data, function(err, results, fields) {
        if(err){
            
            if(err.code == "ER_DUP_ENTRY"){
                response.send('Usuário já cadastrado!');
            }else{
                response.json(err);
            }
        }
        response.json(results);
        console.log('Query executada');
    })
}

module.exports.execQuery = execQuery;
module.exports.connection = connection;