const youtube = require('./services/youtube');
const database = require('./services/database');
const email = require('./services/email');
const videoFilter = require('./filters/videoFilter');
const deduplicator = require('./filters/deduplicator');
const reportFormatter = require('./formatters/reportFormatter');
const logger = require('./utils/logger');
const dateUtils = require('./utils/dateUtils');
const keywords = require('./constants/keywords');
const config = require('../config.json');

async function run() {
  logger.info('Main', 'Starting daily YouTube Shorts viral detection...');
  
  try {
    await database.initDb();
    
    const publishedAfter = dateUtils.getLast24HoursISO();
    let allVideoIds = [];
    
    for (const keyword of keywords) {
      const videoIds = await youtube.searchShorts(keyword, publishedAfter);
      allVideoIds = [...allVideoIds, ...videoIds];
    }
    
    const totalFound = allVideoIds.length;
    logger.info('Main', `Found ${totalFound} total videos from search.`);
    
    const uniqueRawIds = [...new Set(allVideoIds)];
    let videoDetails = [];
    for (let i = 0; i < uniqueRawIds.length; i += 50) {
      const batch = uniqueRawIds.slice(i, i + 50);
      const batchDetails = await youtube.getVideoDetails(batch);
      videoDetails = [...videoDetails, ...batchDetails];
    }
    
    const filterOptions = {
      minViews: config.filtering.minViewCount,
      minLikeRatio: config.filtering.minLikeRatio,
      minEngagementRate: config.filtering.minEngagementRate,
      maxAgeHours: config.filtering.maxAgeHours
    };
    
    const filteredVideos = videoFilter.filterVideos(videoDetails, filterOptions);
    const totalFiltered = filteredVideos.length;
    logger.info('Main', `Filtered down to ${totalFiltered} videos passing criteria.`);
    
    const uniqueVideos = await deduplicator.removeDuplicates(filteredVideos);
    const duplicatesRemoved = totalFiltered - uniqueVideos.length;
    logger.info('Main', `${uniqueVideos.length} unique videos remaining after deduplication.`);
    
    if (uniqueVideos.length === 0) {
      logger.info('Main', 'No new viral videos found today. Sending status email.');
      const stats = { totalFound, totalFiltered: 0, duplicatesRemoved: 0 };
      const textReport = `The YouTube Shorts Bot checked for new viral content today.
- Videos searched: ${totalFound}
- Result: No new videos met the viral criteria in the last 24 hours.

Viral Criteria:
- Minimum views: ${filterOptions.minViews.toLocaleString()}
- Minimum like ratio: ${(filterOptions.minLikeRatio * 100).toFixed(0)}%
- Minimum engagement rate: ${filterOptions.minEngagementRate}%
- Maximum age: ${filterOptions.maxAgeHours} hours

The system is working correctly.`;
      
      const htmlReport = `<h3>System Status: OK</h3>
<p>The bot successfully searched ${totalFound} videos today.</p>
<p><strong>Result:</strong> No new viral YouTube Shorts met your criteria in the last 24 hours.</p>
<h4>Viral Criteria:</h4>
<ul>
  <li>Minimum views: ${filterOptions.minViews.toLocaleString()}</li>
  <li>Minimum like ratio: ${(filterOptions.minLikeRatio * 100).toFixed(0)}%</li>
  <li>Minimum engagement rate: ${filterOptions.minEngagementRate}%</li>
  <li>Maximum age: ${filterOptions.maxAgeHours} hours</li>
</ul>
<p>The system is connected and functioning correctly.</p>`;

      const subject = `Daily YouTube Shorts Report [Status: No New Hits] - ${new Date().toISOString().split('T')[0]}`;
      await email.sendEmailReport(textReport, htmlReport, subject);
    } else {
      for (const video of uniqueVideos) {
        await database.saveVideo(video);
      }
      
      const stats = { totalFound, totalFiltered, duplicatesRemoved };
      const textReport = reportFormatter.generateTextReport(uniqueVideos, stats);
      const htmlReport = reportFormatter.generateHtmlReport(uniqueVideos, stats);
      
      const subject = `Daily YouTube Shorts Viral Report - ${new Date().toISOString().split('T')[0]}`;
      const success = await email.sendEmailReport(textReport, htmlReport, subject);
      
      if (success) {
        await database.markReported(uniqueVideos.map(v => v.videoId));
        logger.info('Main', 'Report sent and database updated.');
      }
    }
    
  } catch (error) {
    logger.error('Main', `Unexpected error: ${error.stack}`);
  } finally {
    logger.info('Main', 'Process completed.');
  }
}

run();
