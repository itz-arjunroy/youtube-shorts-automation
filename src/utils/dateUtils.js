function getLast24HoursISO() {
  const date = new Date();
  date.setHours(date.getHours() - 24);
  return date.toISOString();
}

function formatTimestamp(isoString) {
  return new Date(isoString).toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC';
}

module.exports = {
  getLast24HoursISO,
  formatTimestamp
};
