const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const { v4: uuidv4 } = require('uuid')
const redis = require('redis');

const params = {
  redisPort : process.env.REDIS_PORT,
  redisURL : process.env.REDIS_URL,
  postgresUser: process.env.PGUSER,
  pgHost: process.env.PGHOST,
  pgDatabase: process.env.PGDATABASE,
  pgPassword: process.env.PGPASSWORD,
  pgPort: process.env.PGPORT,
  serverPort: process.env.PORT
}

const corsOptions = {
  origin: '*'
}

// server middleware
const app = express()
app.use(express.json());
app.use(cors(corsOptions));
const port = params.serverPort || 4000

// postgres stuff
const client = new Pool({
  user: 'user' || process.env.PGUSER,
  host: 'localhost' || process.env.PGHOST,
  database: 'user' || process.env.PGDATABASE,
  password: 'password123' || process.env.PGPASSWORD,
  port: 5432 || process.env.PGPORT
})

const TABLES = {
    log_in: 'log_in',
    user_info: 'user_info',
    data_provider: 'data_provider',
    data_market: 'data_market',
    data_restriction: 'data_restriction',
    data_consumer: 'data_consumer'
}


const redisClient = redis.createClient(6379 || params.redisPort,'localhost' || params.redisURL);
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Redis client
const writeKey = async (key, value) => {
  await redisClient.connect()
  redisClient.set(key, value).catch(err => console.log("Error on setting redis key"))

  console.log(`Writing Property : ${key} with value: ${value}`);
}

const getKey = async (key) => {
  await redisClient.connect()
  return redisClient.get(key).catch(err => console.log("Error on getting redis key"))
}

app.get('/status', (_, res) => {
  res.send('Alive')
})

// Log in stuff
app.get('/signin', async (req, res) => {
    const body = req.body
    const query = `SELECT * FROM ${TABLES.log_in} WHERE email= $1`
    const values = [body.email]
    const queryResult = await client.query(query, values)
    
    const account = queryResult.rows[0]
    if (account.password === body.password){
      res.sendStatus(200)
    }else {
      res.send("wrong password")
    }
})
app.post('/signup', async (req, res) => {
    const body = req.body
    const currentTime = new Date().toISOString()
    const query = `INSERT INTO ${TABLES.log_in} (id, email, password, issue_at) VALUES ($1, $2, $3, $4);`
    const values = [uuidv4(), body.email, body.password, currentTime ]
    client
        .query(query, values)
        .then(_ => res.sendStatus(200))
        .catch(err => console.log(err))
})

// Personal information stuff
app.get('/user-info', async (req, res) => {
  const body = req.body
  const query = `SELECT * FROM ${TABLES.user_info} WHERE email= $1`
  const values = [body.email]
  const queryResult = await client.query(query, values)
  res.send(queryResult)
})
app.post('/user-info', async (req, res) => {
  const body = req.body
  const query = `INSERT INTO ${TABLES.user_info} (id, email, name, issue_at) VALUES ($1, $2, $3, $4);`

  const uuid = uuidv4()
  const values = [uuid, body.email, body.name, currentTime ]
  client
    .query(query, values)
    .then(_ => res.send(uuid))
    .catch(err => console.log(err))
})

// Data Marketplace
app.get('/data-marketplace', async (req, res) => {
  const body = req.body
  const query = `SELECT * FROM ${TABLES.data_market} WHERE data_provider_id= $1 && data_base_name=$2`
  const values = [body.data_provider_id, body.data_base_name]
  const queryResult = await client.query(query, values)
  res.send(queryResult)
})
app.post('/data-marketplace', async (req, res) => {
  const body = req.body
  console.log(body)
  const currentTime = new Date().toISOString()
  const query = `INSERT INTO ${TABLES.data_market} (id, data_provider_id, data_base_name,
    data_base_URL, URL_to_IAM_key, insert_at, modify_at) VALUES ($1, $2, $3, 
    $4, $5, $6, $7);`
  const uuid = uuidv4()
  const values = [uuid, body.data_provider_id, body.data_base_name,
    body.data_base_url, body.URL_to_IAM_key, currentTime, currentTime ]
  client
      .query(query, values)
      .then(_ => res.send(uuid))
      .catch(err => console.log(err))
})

// Redis SET / GET
app.post('/publicKey', async (req,res) => {
  const body = req.body
  writeKey(body.key, body.value).then(_ => res.sendStatus(200))
})
app.get('/publicKey', async (req,res) => {
  const body = req.body
  getKey(body.key).then(values => res.send(values))
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})