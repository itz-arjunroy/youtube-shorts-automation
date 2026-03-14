const database = require('../services/database');

async function removeDuplicates(videos) {
  const uniqueVideos = [];
  const videoIdSet = new Set();
  
  for (const video of videos) {
    if (videoIdSet.has(video.videoId)) continue;
    
    const isReported = await database.isVideoReported(video.videoId);
    if (!isReported) {
      uniqueVideos.push(video);
      videoIdSet.add(video.videoId);
    }
  }
  
  return uniqueVideos;
}

module.exports = {
  removeDuplicates
};
