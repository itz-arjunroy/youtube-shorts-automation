function filterVideos(videos, options = {}) {
  const {
    minViews = 20000,
    minLikeRatio = 0.02,
    minEngagementRate = 3,
    maxAgeHours = 24
  } = options;

  const now = new Date();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

  return videos.filter(video => {
    const viewCount = video.viewCount || 0;
    const likeCount = video.likeCount || 0;
    const commentCount = video.commentCount || 0;
    const publishedAt = new Date(video.publishedAt);
    const ageHours = (now - publishedAt) / (1000 * 60 * 60);

    if (ageHours > maxAgeHours) return false;

    if (viewCount < minViews) return false;

    const likeRatio = viewCount > 0 ? likeCount / viewCount : 0;
    const engagementRate = viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;

    video.likeRatio = (likeRatio * 100).toFixed(2);
    video.engagementRate = engagementRate.toFixed(2);
    video.momentum = (viewCount / 1000).toFixed(2);
    video.ageHours = ageHours.toFixed(1);

    return likeRatio >= minLikeRatio && engagementRate >= minEngagementRate;
  });
}

module.exports = {
  filterVideos
};
