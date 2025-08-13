const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!!qazwsx135',  // MySQL 비밀번호
    database: 'ullim_db',
    port: 3306,
    charset: 'utf8mb4'
});

db.connect((err) => {
    if (err) {
        console.error('❌ MySQL 연결 오류:', err);
        return;
    }
    console.log('✅ MySQL 데이터베이스 연결 성공');
});

module.exports = db;
