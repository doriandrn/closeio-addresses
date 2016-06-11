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
const db

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true,
    chunks: false
  }
}))

// enable hot-reload and state-preserving
// compilation error display
app.use(require('webpack-hot-middleware')(compiler))

// glob 
app.set('view engine', 'pug')

MongoClient.connect('mongodb://dorian:dorian22@ds041432.mlab.com:41432/closeio_addresses', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(8090, () => {
    console.log('Listening at http://localhost:8090')
  })
})

app.use('/api', router)



router.get('/', (req, res) => {
  db.collection('addresses').find().toArray(function(err, results) {
  	console.log(results)
  	// send HTML file populated with addresses here
	})
})


