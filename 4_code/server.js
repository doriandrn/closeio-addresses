const koa           = require('koa')
const koaBody       = require('koa-bodyparser')
const Pug           = require('koa-pug')
const app           = koa()
const router        = require('koa-router')()
const mongo         = require('koa-mongo')
const compose       = require('koa-compose')
const common        = require('koa-common')
const webpack       = require('webpack')
const config        = require('./build/webpack.dev.conf')
const compiler      = webpack(config);
const historyApiFallback = require('koa-history-api-fallback');
const webpackMiddleware = require("koa-webpack-dev-middleware")

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
  .put( apiBase, updateAddress )
  .put( apiBase + '/:id', updateAddress )


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

  this.body = yield this.mongo.db('closeio_addresses').collection('addresses').save( this.request.body );
  this.status = 200
  
  // if ! ajax
  // this.redirect('/')
}

function *updateAddress() {
  var _id;

  if ( ! this.params.id ) {
    _id = new ObjectID();
    this.request.body._id = _id;
  } else
    _id = new ObjectID( this.params.id );

  this.body = this.request.body.del ? yield this.mongo.db('closeio_addresses').collection('addresses').remove({"_id": _id }, true ) : yield this.mongo.db('closeio_addresses').collection('addresses').update({"_id": _id }, this.request.body, { upsert: true });
  this.status = 200
 
  // if ! ajax
  // this.redirect('/')
}

app
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(historyApiFallback())
  .use(require("koa-webpack-hot-middleware")(compiler))
  .use(webpackMiddleware(compiler))
  .listen(3000);

