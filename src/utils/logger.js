const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

function getLogFile() {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOG_DIR, `report-${date}.log`);
}

function log(level, module, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] [${module}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(getLogFile(), logMessage);
}

module.exports = {
  info: (module, message) => log('INFO', module, message),
  warn: (module, message) => log('WARN', module, message),
  error: (module, message) => log('ERROR', module, message)
};
