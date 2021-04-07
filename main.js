const express = require('express');
const bodyParser = require('body-parser');
const packageInfo = require('./package.json');
const cors = require('cors')
const errorHandler = require('errorhandler')
const methodOverride = require('method-override')

const app = express();
app.use(bodyParser.json());
const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
}
app.use(cors())
app.use(errorHandler())
app.use(methodOverride())
app.use(allowCrossDomain)

app.get('/', function (req, res) {
  res.json({ author: packageInfo.author });
});
var server = app.listen(process.env.PORT, "0.0.0.0", () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Web server started at http://%s:%s', host, port);
});

module.exports = (bot) => {
  app.post('/' + bot.token, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
};