const mongoose = require('mongoose');
const redis = require('redis');
const { promisify } = require('util');

const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
client.hget = promisify(client.hget);

// get reference to the existing / original exec function within mongoose.
const exec = mongoose.Query.prototype.exec;


// this will called everywhere we want to cache some data
// this is equal to the query we are executing
// a new property function that will executed to know if we have to cache some data or not.
mongoose.Query.prototype.cache = function (options = {}) {

    this.useCache = true
    this.hashKey = JSON.stringify(options.key || '');

    // to make this function chainable
    return this;

}

// below are code that will override the exec function.
// arrow function tries to always to mess with the value of THIS in JS.
mongoose.Query.prototype.exec = async function (){

    if (!this.useCache){
       return exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue){

        const doc = JSON.parse(cacheValue);

       return Array.isArray(doc) 
        ? doc.map(d => new this.model(d))
        : new this.model(doc);

    }

    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
};

module.exports = {
    clearHash(hashKey){
       client.del(JSON.stringify(hashKey));
    }
}

