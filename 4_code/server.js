const express       = require('express')
const MongoClient 	= require('mongodb').MongoClient
const bodyParser    = require('body-parser')
const webpack       = require('webpack')
const config        = require('./build/webpack.dev.conf')
const _             = require('lodash')
const fs            = require('fs')
const pug           = require('pug')

const app           = express()
const router        = express.Router()
const compiler      = webpack(config)
const jsonParser    = bodyParser.json()
var db

// Establish connection first
MongoClient.connect('mongodb://dorian:dorian22@ds041432.mlab.com:41432/closeio_addresses', (err, database) => {
  if (err) 
  	return console.log(err)
  db = database
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())
app.use(bodyParser.urlencoded({extended: true}))

app.set('views', './src')
app.set('view engine', 'pug')

// serve webpack bundle output
app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true,
    chunks: false
  }
}))

app.use(require('webpack-hot-middleware')(compiler))

router.post('/addresses', (req,res) => {
	db.collection('addresses').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.render('index', db.collection('addresses').find().toArray(function(err, results) {
			console.log('st baiat')
		}))
  })
}) 

router.get('/', (req, res) => {
  
})


app.use('/', router)

app.listen(8090, () => {
  console.log('Listening at http://localhost:8090')
})




