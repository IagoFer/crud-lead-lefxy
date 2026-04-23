export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/lefxy-crm',
  },
  redis: {
    url: process.env.REDIS_URL || '',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  followUp: {
    delayHours: parseInt(process.env.FOLLOW_UP_DELAY_HOURS || '24', 10),
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
});
