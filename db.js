const mysql = require('mysql2');

const connection = mysql.createConnection({
    host:"localhost",
    port:"3507",
    user:"root",
    password:"123456",
    database:"onlinetrade"
})

connection.connect((err)=>{
    if(err){
        console.log("Failed to connect db");
        return;
    }else {
        console.log("db is connected");
    }
})

module.exports = connection;