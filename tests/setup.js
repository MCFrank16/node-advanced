jest.setTimeout(60000);

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

// telling mongoose to use node.js promise implementation
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
    useMongoClient: true
});