const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const { v4: uuidv4 } = require('uuid')
const redis = require('redis');
const AWS = require('aws-sdk')
const { RDSClient, AddRoleToDBClusterCommand } = require("@aws-sdk/client-rds");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto')


// get config vars
dotenv.config();
const env = {
  redisPort : process.env.REDIS_PORT,
  redisURL : process.env.REDIS_URL,
  postgresUser: process.env.PGUSER,
  pgHost: process.env.PGHOST,
  pgDatabase: process.env.PGDATABASE,
  pgPassword: process.env.PGPASSWORD,
  pgPort: process.env.PGPORT,
  serverPort: process.env.PORT,
  tokenSecret: process.env.TOKEN_SECRET,
  passPhrase: process.env.PASS_PHRASE,
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY
}


// CORS stuff
const corsOptions = {
  origin: '*'
}


// server middleware
const app = express()
app.use(express.json());
app.use(cors(corsOptions));
const port = env.serverPort || 4000

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
    data_consumer: 'data_consumer',
    data_requested: 'data_requested',
    iam_management: 'iam_management'
}


//=============== Redis client =============
const redisClient = redis.createClient(6379 || env.redisPort,'localhost' || env.redisURL);
redisClient.on('error', (err) => console.log('Redis Client Error', err));
const writeKey = async (key, value) => {
  await redisClient.connect()
  redisClient.set(key, value).catch(err => console.log("Error on setting redis key"))

  console.log(`Writing Property : ${key} with value: ${value}`);
}

const getKey = async (key) => {
  await redisClient.connect()
  return redisClient.get(key).catch(err => console.log("Error on getting redis key"))
}
// ==========================================

// ==========================================Shareable query calls==========================================
const queries = {
  getDataMarkeyByID: async (data_market_id) => {
    // get data_market from data_market_id
    const queryMarket = `SELECT * FROM ${TABLES.data_market} WHERE id = $1`
    const queryMarketValues = [data_market_id]
    const queryMarketResults = await client.query(queryMarket, queryMarketValues)
    const dataMarket = queryMarketResults.rows[0]
    return dataMarket
  },
  getDataRequestByID: async (data_market_id) => {
    const queryMarket = `SELECT * FROM ${TABLES.data_requested} WHERE data_market_id = $1`
    const queryMarketValues = [data_market_id]
    const queryMarketResults = await client.query(queryMarket, queryMarketValues)
    const dataMarket = queryMarketResults.rows[0]
    return dataMarket
  }
}

// ================== Middleware ==========================
const generateAccessToken = (username) => {
  return jwt.sign({
    user: username,
    isAuthenticated: true
  }, env.tokenSecret, {expiresIn: "1 day"})
}

const authenticateToken = (req, res, next ) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)
  jwt.verify(token, env.tokenSecret, (err, tokenPayload) => {
    if (err) {
      console.log(err)
      return res.sendStatus(403)
    }
    req.tokenPayload = tokenPayload
    next()
  })
}
//====================================================================================

// ======================Request public key======================
app.get('/publicKey',authenticateToken, (_, res) => {
  res.send(keys.public)
})
// ==============================================================
// ======================Health check======================
app.get('/status', (_, res) => {
  res.send('Alive')
})
// ==================================================================

// ======================Log in stuff======================
app.get('/signin', async (req, res) => {
    const body = req.body
    const query = `SELECT * FROM ${TABLES.log_in} WHERE email= $1`
    const values = [body.email]
    const queryResult = await client.query(query, values)
    
    const account = queryResult.rows[0]
    if (account.password === body.password){
      const token = generateAccessToken(body.email)
      res.send({
        token,
        publicKey: keys.public
      })
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
// ==================================================================

// =============================Personal information stuff=============================
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
// =======================================================================================

// =============================Data Marketplace=============================
app.post('/data-marketplace', async (req, res) => {
  const query = `SELECT * FROM ${TABLES.data_market}`
  const queryResult = await client.query(query, [])
  res.send(queryResult.rows[0].id)
})
app.post('/data-marketplace', async (req, res) => {
  const body = req.body
  const currentTime = new Date().toISOString()
  const query = `INSERT INTO ${TABLES.data_market} (id, data_provider_id, data_base_name,
    data_base_URL, URL_to_IAM_key, insert_at, modify_at) VALUES ($1, $2, $3, 
    $4, $5, $6, $7);`
  const uuid = uuidv4()
  const values = [uuid, body.data_provider_id, body.data_base_name,
    body.data_base_url, body.URL_to_IAM_key, currentTime, currentTime ]
  client
      .query(query, values)
      .then(_ => res.send({dataMarketId: uuid}))
      .catch(err => console.log(err))
})
// =======================================================================================


// =============================Data request=============================
app.get('/data-request/requestId/:requestId', async (req, res) => {
  const queryParams = req.params.requestId
  const query = `SELECT * FROM ${TABLES.data_requested} WHERE id= $1`
  const values = [queryParams.data_request_id, ]
  const queryResult = await client.query(query, values)
  res.send(queryResult.rows)
})
app.get('/data-request/provider/:providerId', async (req, res) => {
  const providerId = req.params.providerId
  const query = `SELECT * FROM ${TABLES.data_requested} WHERE data_provider_id = $1`
  const values = [providerId]
  const queryResult = await client.query(query, values)
  res.send(queryResult.rows)
})
app.post('/data-request', async (req, res) => {
  const body = req.body
  // get data_market from data_market_id
  const queryMarket = `SELECT * FROM ${TABLES.data_market} WHERE id = $1`
  const queryMarketValues = [body.data_market_id]
  const queryMarketResults = await client.query(queryMarket, queryMarketValues)
  const dataMarket = queryMarketResults.rows[0]

  // write to data_requested table
  const currentTime = new Date().toISOString()
  const query = `INSERT INTO ${TABLES.data_requested} (id, data_provider_id, consumer_id, data_market_id, 
    data_base_name, isApproved,
    insert_at, modify_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`
  const uuid = uuidv4()
  const values = [uuid, dataMarket.data_provider_id, body.consumer_id,
    body.data_market_id, dataMarket.data_base_name,
    body.isApproved,currentTime, currentTime ]
  client
      .query(query, values)
      .then(_ => res.send(uuid))
      .catch(err => console.log(err))
})
app.put('/data-request', async (req, res) => {
  const allowedStatus = {
    pending: "pending",
    approved: "approved",
    rejected: "rejected"
  }
  const body = req.body
  const currentTime = new Date().toISOString()
  const query = `UPDATE ${TABLES.data_requested} SET isapproved = $1, modify_at= $2 WHERE id = $3;`
  const values = [allowedStatus[body.isApproved],currentTime, body.uuid]
  client
      .query(query, values)
      .then(_ => res.sendStatus(200))
      .catch(err => console.log(err))
})
// =======================================================================================

// =============================Query data=============================
app.post('/query-data', authenticateToken, async (req, res) => {
  const {
    data_market_id,
    consumer_id
  } = req.body

  // Get public key, generate both key locally, then added public key here
  

  // Decypt the credentials with public key

  // generate a new client of rds everytime this method is called
  const clientCredentials = new AWS.Credentials({accessKeyId: "", secretAccessKey: ""})

  // Check if the consumer has permission
  const dataRequest = queries.getDataRequestByID(data_market_id)
  if (dataRequest.isapproved !== "apporved"){
    res.send(`consumerId: ${consumer_id} does not have permission to access this data set`)
  }

  // Used the client that build with credentials to 
  const RDSClient = new RDSClient({credentials: clientCredentials })
  // tutorial to kick off the message => https://npm.io/package/@aws-sdk/client-rds
  RDSClient.send(command).then().catch().finally()

})

// =======================================================================================

// Redis SET / GET
// app.post('/publicKey', async (req,res) => {
//   const body = req.body
//   writeKey(body.key, body.value).then(_ => res.sendStatus(200))
// })
// app.get('/publicKey', async (req,res) => {
//   const body = req.body
//   getKey(body.key).then(values => res.send(values))
// })
// ==========================================================

// ============================= IAM management =============================
app.get('/iam-management/:providerId/:dataMarketId', async (req, res) => {
  const providerId = req.params.providerId
  const dataMarketId = req.params.dataMarketId
  const query = `SELECT * FROM ${TABLES.iam_management} WHERE data_provider_id = $1 AND data_market_id = $2`
  const values = [providerId, dataMarketId]
  const queryResult = await client.query(query, values)
  res.send(queryResult.rows)
})
app.post('/iam-management', async (req, res) => {
  const body = req.body
  // get data_market from data_market_id
  const dataMarket = await queries.getDataMarkeyByID(body.dataMarketId)
  const queryMarket = `INSERT INTO ${TABLES.iam_management} (id, data_provider_id, data_market_id, access_key, secret_key,  insert_at, modify_at ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)`
  
  const currentTime = new Date().toISOString()
  const uuid = uuidv4()

  // resolved with https://stackoverflow.com/questions/66335231/node-crypto-instead-of-jsencrypt-for-encryption-with-public-key
  const access_key = crypto.privateDecrypt({
    key: env.privateKey,
    padding: crypto.constants.RSA_PKCS1_PADDING // padding is the key to solve the mismatch between jsencrypr and crypto libs
  }, Buffer.from(body.accessKey, "base64"))
  const secret_key = crypto.privateDecrypt({
    key: env.privateKey,
    padding: crypto.constants.RSA_PKCS1_PADDING
  }, Buffer.from(body.secretKey, "base64"))
  const queryMarketValues = [uuid, dataMarket.data_provider_id, dataMarket.id, access_key, secret_key, currentTime, currentTime]
  client
    .query(queryMarket, queryMarketValues)
    .then(res.sendStatus(200))
    .catch(err => console.log(err))
})
// ==========================================================


// ============================= Launch the app =============================
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})