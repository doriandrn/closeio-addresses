const koa           = require('koa')
const koaBody       = require('koa-body');
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
var addresses

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


// // pug.use('server')
// // app.use(require('koa-static')('/Users/dorian/DRN/srv/closeio/_sources/4_code/dist', {}));

// // server.use( function *(next)  {
// //   // var addresses = yield this.mongo.db('closeio_addresses').collection('addresses').find().toArray();
// //   // yield next;
// //   // this.render('addresses', { path: config.output.path, addresses: addresses }, true)
// //   this.body = 'mata ta'
// //   // 
// // });

// // const CONTENT_TYPE_HTML = 'text/html';

// // app.use(function* rewriteIndex(next) {
// //   if (this.accepts().toString().substr(0, CONTENT_TYPE_HTML.length) === CONTENT_TYPE_HTML) {
// //     this.request.url = '/index.html';
// //   }
// //   yield *next;
// // });


// // router.get('/', function *(next) {
// //   console.log('gothome')
// //   var addresses = yield this.mongo.db('closeio_addresses').collection('addresses').find().toArray();
// //   this.render('addresses', { path: config.output.path, addresses: addresses }, true)
// //   // this.body = 'caca'
// // });
// // // 

// // app.use( compose([webpackMiddleware(webpack(config)),function *(next)  {
// //   var addresses = yield this.mongo.db('closeio_addresses').collection('addresses').find().toArray();
// //   // yield next;
// //   this.render('addresses', { path: config.output.path, addresses: addresses }, true)
// //   // this.body = 'mata ta'
// //   // 
// // } ]) ) 

// // var fs = require('fs');

// // var readFileThunk = function(src) {
// //   return new Promise(function (resolve, reject) {
// //     fs.readFile(src, {'encoding': 'utf8'}, function (err, data) {
// //       if(err) return reject(err);
// //       resolve(data);
// //     });
// //   });
// // }
// //
// // var render = views("dist", { map: { html: 'pug' } });
// // app.use(webpackDevServer({
// //   config: config,
// // }))


router
  .get('/', function *(next) {
    console.log('gothome');
    // this.body = yield readFileThunk(__dirname + '/dist/index.html');
    
    addresses = yield this.mongo.db('closeio_addresses').collection('addresses').find().toArray();
    this.render('index', { path: config.output.path, addresses: addresses, aici: 'da' }, true)
    // yield next
    // yield *next;
    // this.body = 'Hello World!';
  })
  .post('/api/lead/id/addresses', function *(next) {
    // ...
    // this.body = 'address added';
    this.render('index', { path: config.output.path, addresses: addresses }, true)
    // yield next
  })
  .put('/api/lead/id/addresses/:id', function *(next) {
    // ...
  })
  .del('/api/lead/id/addresses/:id', function *(next) {
    // ...
  });

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(historyApiFallback())
  .use(require("koa-webpack-hot-middleware")(compiler))
  .use(webpackMiddleware(compiler))
  .listen(3000);

