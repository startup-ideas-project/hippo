const express = require('express')
const { Pool } = require('pg')
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(express.json());
const port = process.env.PORT || 3000
const client = new Pool({
    user: 'user' || process.env.PGUSER,
    host: 'localhost' || process.env.PGHOST,
    database: 'user' || process.env.PGDATABASE,
    password: 'password123' || process.env.PGPASSWORD,
    port: 5432 || process.env.PGPORT
  })


const TABLES = {
    log_in: 'log_in',
    personal_info: 'personal_info'
}

app.get('/status', (req, res) => {
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
app.get('/personalInfo', async (req, res) => {
  const body = req.body
  const query = `SELECT * FROM ${TABLES.log_in} WHERE email= $1`
  const values = [body.email]
  const queryResult = await client.query(query, values)
  res.send(queryResult)
})
app.post('/personalInfo', async (req, res) => {
  const body = req.body
  const query = `INSERT INTO ${TABLES.personal_info} (id, email, name, issue_at) VALUES ($1, $2, $3, $4);`
  const values = [body.email]
  const queryResult = await client.query(query, values)
  res.send(queryResult)
})

// Useful data base info stuff


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})