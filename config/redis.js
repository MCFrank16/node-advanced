const redis = require('redis');
const { promisify } = require('util');
const redisURL = 'redis://127.0.0.1:6379';

const client = redis.createClient(redisURL);

module.exports = get = (key) => promisify(client.get(key));
module.exports = set = (key, value) => client.set(key, value);