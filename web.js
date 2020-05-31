var port = Number(process.env.PORT || 5000);

var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var logfmt = require('logfmt');
var fs = require('fs');
var pg = require('pg'),
  connectionString = process.env.dbconnstr,
  client,
  query;

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
  .get('/PluginManager.js', function (req, res) {
    res.setHeader('content-type', 'text/javascript');
    var names = [],
      files = [];
    client = new pg.Client({ connectionString: connectionString });
    client.connect();
    query = client.query(new pg.Query('SELECT * FROM plugins'));
    query.on('row', function (row) {
      names.push(row.name);
      files.push(row.file);
    });
    query.on('end', function () {
      client.end();
      fs.readFile(
        path.resolve(__dirname, 'files', 'PluginManager.js'),
        'utf8',
        function (err, data) {
          var newFile = data;
          if (!err) {
            for (var i in names) {
              if (data.indexOf('addInList(' + names[i]) < 0) {
                var addInList = "addInList('" + names[i] + "', false);";
                newFile = newFile.replace(
                  '$.chat.subscribe(onEvent);',
                  addInList + '\n$.chat.subscribe(onEvent);'
                );
                fs.writeFile(
                  path.resolve(
                    __dirname,
                    'files',
                    'plugins',
                    'injected',
                    names[i] + '.js'
                  ),
                  files[i],
                  function (err) {}
                );
              }
            }
            res.send(newFile);
          } else res.send(newFile);
        }
      );
    });
  })
  .post('/plugin-add', function (req, res) {
    var name = req.body.pluginName.replace(/\W/g, '');
    if (req.body.pluginFile.length < 100000) {
      client = new pg.Client(connectionString);
      client.connect();
      query = client.query(
        new pg.Query('DELETE FROM plugins WHERE name = $1', [name])
      );
      query.on('end', function () {
        query = client.query(
          new pg.Query('INSERT INTO plugins(name,file) VALUES($1,$2)', [
            name,
            req.body.pluginFile,
          ])
        );
        query.on('end', function () {
          query = client.query(
            new pg.Query(
              'DELETE FROM plugins_backup WHERE name = $1 AND file = $2',
              [name, req.body.pluginFile]
            )
          );
          query.on('end', function () {
            query = client.query(
              new pg.Query(
                'INSERT INTO plugins_backup(name,file) VALUES($1,$2)',
                [name, req.body.pluginFile]
              )
            );
            query.on('end', function () {
              client.end();
              res.send(200);
            });
          });
        });
      });
    } else res.send(413);
  })
  .post('/plugin-remove', function (req, res) {
    client = new pg.Client(connectionString);
    client.connect();
    query = client.query(
      new pg.Query('DELETE FROM plugins WHERE name = $1', [req.body.pluginName])
    );
    query.on('end', function () {
      client.end();
      res.send(200);
    });
  })
  .post('/plugin-rollback', function (req, res) {
    var names = [],
      files = [];
    client = new pg.Client(connectionString);
    client.connect();
    query = client.query(
      new pg.Query('SELECT * FROM plugins_backup WHERE name = $1', [
        req.body.pluginName,
      ])
    );
    query.on('row', function (row) {
      names.push(row.name);
      files.push(row.file);
    });
    query.on('end', function () {
      var randName, randFile;
      do {
        randName = names[Math.floor(Math.random() * names.length)];
        randFile = files[Math.floor(Math.random() * files.length)];
      } while ((!randName || !randFile) && names.length > 0 && files.length > 0);
      if (randName && randFile) {
        query = client.query(
          new pg.Query('DELETE FROM plugins WHERE name = $1', [randName])
        );
        query.on('end', function () {
          query = client.query(
            new pg.Query('INSERT INTO plugins(name,file) VALUES($1,$2)', [
              randName,
              randFile,
            ])
          );
          query.on('end', function () {
            client.end();
            res.send(200);
          });
        });
      } else res.send(403);
    });
  });

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
});

server.listen(port, function () {
  console.log('Listening on ' + port);
});
