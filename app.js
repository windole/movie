var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var port = process.env.PORT || 3000;
var app = express();
var cookieSession = require('cookie-session')
var mongoStore = require('connect-mongo')(session)
var dbUrl = 'mongodb://localhost/imooc';
var logger = require('morgan');


mongoose.Promise = global.Promise;
mongoose.connect(dbUrl);
mongoose.connection.on('connected', function () {
  console.log('Connection success!');
});

app.set('views', './app/views/pages');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  secret:'movie',
  store: new mongoStore({
      url:dbUrl,
      connection:'sessions'
  })
}))
app.locals.moment = require('moment');
app.listen(port, function () {
  console.log('server start on port:' + port);
});

if('development' === app.get('env')){
  app.set('showStackError',true);
  //app.use(express.logger(':method :url :status'));
  app.use(logger(':method :url :status'));
  app.locals.pretty = true;
  mongoose.set('debug',true);
}
require('./config/routes')(app);


