var port = Number(process.env.PORT || 5000);

var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var logfmt = require('logfmt');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

app
  .use(logfmt.requestLogger())
  .use('/files', express.static(path.join(__dirname, 'files')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }));

// nkt v2
app.use('/beta', express.static(path.join(__dirname, 'beta')));
app.get('/port', (req, res) => res.json({ port }));

// redirect on https
app.get('*', function (req, res, next) {
  if (
    req.headers['x-forwarded-proto'] != 'https' &&
    process.env.NODE_ENV !== 'dev'
  ) {
    res.redirect('https://nkt.herokuapp.com' + req.url);
    return;
  }
  next();
});

app
  .get('/', function (req, res) {
    res.header(
      'Cache-Control',
      'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
    );
    // res.header('Content-Security-Policy', "default-src 'self' wss://nkt.herokuapp.com; script-src 'self' 'unsafe-eval' 'unsafe-inline'");
    res.render('test.pug', {
      title: 'Home',
      port: port,
    });
  })
  .get('/port.js', function (req, res) {
    res.send('var port=' + port + ';');
  })

io.on('connection', function (socket) {
  socket.on('new_msg2', function (data) {
    if (data) socket.broadcast.emit('new_msg2', data);
  });

  socket.on('ping2', function (data) {
    if (data) socket.broadcast.emit('ping2', data);
  });

  socket.on('nktp2', function (data) {
    if (data) socket.broadcast.emit('nktp2', data);
  });
  socket.on('corev2', function (data) {
    if (data) socket.broadcast.emit('corev2', data);
  });
});

server.listen(port, function () {
  console.log('Listening on ' + port);
});
