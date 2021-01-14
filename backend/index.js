// Load the libraries required
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet')
const RateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const userRoutes = require('./routes/user');
const wsRoutes = require('./routes/ws');
const postRoutes = require('./routes/posts');

const PORT = parseInt(process.env.PORT) || 3000;

const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    timezone: '+08:00',
    connectionLimit: 5,
    waitForConnections: true,
    port: process.env.DB_PORT,
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, '/certs/ca.pem')),
      },
});

const mongoClient = new MongoClient(process.env.MONGO_CLIENT_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();

app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.json({ limit: '50mb' }));
app.use(new RateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1000,
    delayMs: 0
}));
app.use(helmet());
app.use(cors());

app.use('/user', userRoutes(pool));
app.use('/', wsRoutes(app, pool));
app.use('/posts', postRoutes(mongoClient));

const p0 = (async ()=> {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return true;
})();

const p1 = mongoClient.connect();

Promise.all([p0, p1]).then( () => {

	app.listen(PORT, () => {
		console.info(`Application started on port ${PORT} at ${new Date()}`);
	})
})
.catch( err => {
    console.error(err);
});