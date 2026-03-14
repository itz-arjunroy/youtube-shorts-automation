const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const DB_DIR = path.join(__dirname, '../../db');
const DB_PATH = path.join(DB_DIR, 'shorts.db');

// Ensure db directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    logger.error('Database', `Error opening database: ${err.message}`);
  } else {
    logger.info('Database', 'Connected to the SQLite database.');
  }
});

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        videoId TEXT UNIQUE,
        title TEXT,
        channelTitle TEXT,
        channelId TEXT,
        viewCount INTEGER,
        likeCount INTEGER,
        commentCount INTEGER,
        publishedAt TEXT,
        thumbnailUrl TEXT,
        videoUrl TEXT,
        firstDetectedAt TEXT,
        lastUpdatedAt TEXT,
        reportedAt TEXT,
        momentum REAL,
        likeRatio REAL
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reportDate TEXT,
        videosIncluded INTEGER,
        emailSent BOOLEAN,
        emailSentAt TEXT,
        errorMessage TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channelId TEXT UNIQUE,
        channelTitle TEXT,
        viralVideoCount INTEGER DEFAULT 0,
        lastAppearedAt TEXT
      )`, (err) => {
        if (err) {
          logger.error('Database', `Error initializing tables: ${err.message}`);
          reject(err);
        } else {
          logger.info('Database', 'Tables initialized.');
          resolve();
        }
      });
    });
  });
}

function isVideoReported(videoId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT videoId FROM videos WHERE videoId = ? AND reportedAt IS NOT NULL', [videoId], (err, row) => {
      if (err) reject(err);
      resolve(!!row);
    });
  });
}

function saveVideo(video) {
  return new Promise((resolve, reject) => {
    const { videoId, title, channelTitle, channelId, viewCount, likeCount, commentCount, publishedAt, thumbnailUrl, videoUrl, momentum, likeRatio } = video;
    const now = new Date().toISOString();
    
    db.run(`INSERT INTO videos (videoId, title, channelTitle, channelId, viewCount, likeCount, commentCount, publishedAt, thumbnailUrl, videoUrl, firstDetectedAt, lastUpdatedAt, momentum, likeRatio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(videoId) DO UPDATE SET
            viewCount = excluded.viewCount,
            likeCount = excluded.likeCount,
            lastUpdatedAt = excluded.lastUpdatedAt,
            momentum = excluded.momentum,
            likeRatio = excluded.likeRatio`,
    [videoId, title, channelTitle, channelId, viewCount, likeCount, commentCount, publishedAt, thumbnailUrl, videoUrl, now, now, momentum, likeRatio],
    function(err) {
      if (err) reject(err);
      resolve(this.lastID);
    });
  });
}

function markReported(videoIds, reportDate) {
  const placeholders = videoIds.map(() => '?').join(',');
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    db.run(`UPDATE videos SET reportedAt = ? WHERE videoId IN (${placeholders})`, [now, ...videoIds], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

module.exports = {
  initDb,
  isVideoReported,
  saveVideo,
  markReported
};
