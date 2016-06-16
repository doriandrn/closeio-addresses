const koa           = require('koa')
// const koaBody       = require('koa-body')({json:true})
const koaBody       = require('koa-bodyparser')
// const koaBody       = require('koa-better-body')
const Pug           = require('koa-pug')
const app           = koa()
// const server        = koa()
// const serve         = require('koa-static');
const router        = require('koa-router')()
const mongo         = require('koa-mongo')
// const views         = require('koa-views')
const compose       = require('koa-compose')
const common        = require('koa-common');
const webpack       = require('webpack')
const config        = require('./build/webpack.dev.conf')
const compiler      = webpack(config);
const historyApiFallback = require('koa-history-api-fallback');
const webpackMiddleware = require("koa-webpack-dev-middleware")
// var webpackDevServer = require('koa-webpack-dev');
var addresses,
    ObjectID = require('mongodb').ObjectID,
    apiBase = '/api/lead/id/addresses';

config.historyApiFallback = true

const pug = new Pug({
  viewPath: './src',
  debug: false,
  pretty: false,
  compileDebug: true,
  basedir: '/dist',
  app: app 
})

app.use(common.logger('dev'));

app.use(mongo({
  uri: 'mongodb://dorian:dorian22@ds041432.mlab.com:41432/closeio_addresses',
  max: 100,
  min: 1,
  timeout: 30000,
  log: false
}));

router
  // App execution
  .get('/', getAddresses)

  // API
  .get( apiBase + '/:id', getAddress )
  .post( apiBase, addAddress )
  .post( apiBase + '/:id', updateAddress )


function *getAddresses(next) {
  addresses = yield this.mongo.db('closeio_addresses').collection('addresses').find().toArray();
  this.render('index', { path: config.output.path, addresses: addresses }, true)
}

function *getAddress() {
  this.body = yield this.mongo.db('closeio_addresses').collection('addresses').find({"_id": new ObjectID( this.params.id ) }).limit(1).toArray();
  this.status = 200;
}

function *addAddress() {
  console.log(  this.request.type );
  console.log(  this.request.body );
  
  if ( this.request.body.length < 1 )
    console.error( 'Could not add address! Empty object supplied.')

  this.mongo.db('closeio_addresses').collection('addresses').save( this.request.body, (err, result) => {
    if (err) 
      return console.log(err)

    console.log('Added new address!')
  })

  this.status = 200
  this.redirect('/')

}

function *updateAddress(id) {
  if ( this.request.body.del ) {
    // delete
    this.body = yield this.mongo.db('closeio_addresses').collection('addresses').remove({"_id": new ObjectID( this.params.id ) }, true );
    console.log('Address Removed');
  } else {
    //update
    this.body = this.mongo.db('closeio_addresses').collection('addresses').update({"_id": new ObjectID( this.params.id ) }, this.body, { upsert: true }, ( err, result ) => {
      if (err) 
        return console.log(err)
      console.log('Address Updated');
    });
    
  }
  this.status = 200
  this.redirect('/')
}

app
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(historyApiFallback())
  .use(require("koa-webpack-hot-middleware")(compiler))
  .use(webpackMiddleware(compiler))
  .listen(3000);

