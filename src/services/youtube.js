const axios = require('axios');
const config = require('../utils/config');
const logger = require('../utils/logger');

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function searchShorts(keyword, publishedAfter) {
  try {
    logger.info('YouTube', `Searching for "${keyword}" after ${publishedAfter}`);
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        type: 'video',
        videoDuration: 'short',
        order: 'date',
        maxResults: 50,
        publishedAfter: publishedAfter,
        q: keyword,
        key: config.YT_API
      }
    });
    return response.data.items.map(item => item.id.videoId);
  } catch (error) {
    logger.error('YouTube', `Search failed for "${keyword}": ${error.message}`);
    return [];
  }
}

async function getVideoDetails(videoIds) {
  if (videoIds.length === 0) return [];
  
  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'statistics,contentDetails,snippet',
        id: videoIds.join(','),
        key: config.YT_API
      }
    });
    
    return response.data.items.map(item => ({
      videoId: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.default.url,
      viewCount: parseInt(item.statistics.viewCount) || 0,
      likeCount: parseInt(item.statistics.likeCount) || 0,
      commentCount: parseInt(item.statistics.commentCount) || 0,
      videoUrl: `https://youtube.com/watch?v=${item.id}`,
      description: item.snippet.description.substring(0, 200)
    }));
  } catch (error) {
    logger.error('YouTube', `Failed to get video details: ${error.message}`);
    return [];
  }
}

module.exports = {
  searchShorts,
  getVideoDetails
};
