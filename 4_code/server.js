const koa           = require('koa')
const koaBody       = require('koa-body');
const Pug           = require('koa-pug')
const app           = koa()
const router        = require('koa-router')()
const mongo         = require('koa-mongo');
// const MongoClient   = require('mongodb').MongoClient

// var db = db || {}, updResults

// Establish connection first
// MongoClient.connect('mongodb://dorian:dorian22@ds041432.mlab.com:41432/closeio_addresses', (err, database) => {
//   if (err) 
//     return console.log(err)
//   console.log( database )
//   db = database
// });

const pug = new Pug({
  viewPath: './src',
  debug: false,
  pretty: false,
  compileDebug: false,
  // locals: global_locals_for_all_pages,
  basedir: './src',
  app: app // equals to pug.use(app) and app.use(pug.middleware)
})

app.use(mongo({
  uri: 'mongodb://dorian:dorian22@ds041432.mlab.com:41432/closeio_addresses',
  max: 100,
  min: 1,
  timeout: 30000,
  log: false
}));


pug.locals.fetchx = 'luv'

app.use(function* (next) {
  this.mongo.db('closeio_addresses').collection('addresses').findOne({}, function (err, doc) {
    // console.log(doc);
  });

  var addresses = yield this.mongo.db('closeio_addresses').collection('addresses').find().toArray();
  this.render('index', {title: 'fml', addresses: addresses }, true)
});


// router.post('/addresses', koaBody,
//   function *(next) {
//     console.log(this.request.body);
    
//     // this.body = JSON.stringify(this.request.body);
//   }
// );

app.listen(3000);

// handle fallback for HTML5 history API
// app.use(morgan('combined'))
// app.use(require('connect-history-api-fallback')())
// app.use(bodyParser.urlencoded({extended: true}))

// app.set('views', './src')
// app.set('view engine', 'pug')

// const isDeveloping = process.env.NODE_ENV !== 'production';
// const port = isDeveloping ? 3000 : process.env.PORT;

// if (isDeveloping) {
//   const compiler = webpack(config);
//   const middleware = webpackMiddleware(compiler, {
//     publicPath: config.output.publicPath,
//     stats: {
//       colors: true,
//       hash: true,
//       timings: true,
//       chunks: false,
//       chunkModules: false,
//       modules: false
//     }
//   });

//   app.use(historyApiFallback({verbose: false}));

//   app.use(middleware);
//   app.use(webpackHotMiddleware(compiler));

//   app.get('/', function response(req, res) {
//     console.log('servicm');
//     res.send(middleware.fileSystem.readFileSync(path.join(__dirname, '/dist/index.html')));
//   });
// } else {
//   app.use(express.static(__dirname + '/dist'));
//   app.get('*', function response(req, res) {
//     res.sendFile(path.join(__dirname, 'dist/index.html'));
//   });
// }

// app.get('/', (req, res) => {
//   console.log('HOME');
// });

// app.get('/addresses', (req, res) => {
//   console.log('ecf')
//   res.render('index', {
//      title: 'title' 
//    })
//   db.collection('addresses').find().toArray( (err, results) => {
//     if (err) return console.log(err)
//     console.log( results );
    
//   })
// })

// router.post('/addresses', (req,res) => {
//   db.collection('addresses').save(req.body, (err, result) => {
//     if (err) return console.log(err)

//     console.log('Added new address!')

//     res.redirect('/addresses')
//   })
// }) 



// app.use('/api', router)

// app.listen(port, () => {
//   console.log('Listening at http://localhost:'+port)
// })




