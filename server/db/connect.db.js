const mongoose = require('mongoose');
const { mongoUri, mongoDbName, mongoOptions } = require('./config.db');
let isConnected = false;

async function connectMongo() {
  if (isConnected) return mongoose.connection;
  mongoose.connection.on('connected', () => console.log('[Mongo] connected'));
  mongoose.connection.on('error', (e) => console.error('[Mongo] error', e));
  mongoose.connection.on('disconnected', () => console.warn('[Mongo] disconnected'));

  await mongoose.connect(mongoUri, { ...mongoOptions, dbName: mongoDbName });

  isConnected = true;
  return mongoose.connection;
}

async function disconnectMongo() {
  await mongoose.disconnect();
  isConnected = false;
}

module.exports = { connectMongo, disconnectMongo };
