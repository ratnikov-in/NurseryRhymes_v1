const mongoose = require('mongoose')
const uri = "mongodb+srv://kcls_bot:Qwe123@cluster0.ms828.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
const bot = require('./bot');
require('./main')(bot);