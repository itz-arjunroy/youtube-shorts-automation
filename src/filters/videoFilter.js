function filterVideos(videos, minViews = 25000, minLikeRatio = 0.8) {
  return videos.filter(video => {
    const likeRatio = video.viewCount > 0 ? video.likeCount / video.viewCount : 0;
    
    // Calculate a simple momentum score for sorting (total views as a proxy if first time)
    video.likeRatio = (likeRatio * 100).toFixed(2);
    video.momentum = (video.viewCount / 1000).toFixed(2); // Simple placeholder for momentum
    
    return video.viewCount >= minViews && likeRatio >= minLikeRatio;
  });
}

module.exports = {
  filterVideos
};
