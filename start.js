const mongoose = require('mongoose')
const uri = "";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
const bot = require('./bot');
require('./main')(bot);
