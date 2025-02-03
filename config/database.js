import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'sql5.freesqldatabase.com',
    user: 'sql5760238',
    password: 'MIrfk8qTXh',
    database: 'sql5760238',
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

export default connection;  // Usamos export default
