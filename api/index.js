// Vercel serverless function wrapper
const app = require('../server/index.js');

// Export as serverless function
module.exports = (req, res) => {
  return app(req, res);
};
