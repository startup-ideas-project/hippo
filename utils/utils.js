
const crypto = require("crypto");
// generate random token
// require('crypto').randomBytes(64).toString('hex')



// Private / Public Key:
const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }})

const data = "welcome to unleash access"

const cipherText = crypto.publicEncrypt(publicKey, data)
console.log("cipher text")
console.log(cipherText.toString())

const decrypt = crypto.privateDecrypt(privateKey, cipherText)
console.log("decrypt value")
console.log(decrypt.toString())