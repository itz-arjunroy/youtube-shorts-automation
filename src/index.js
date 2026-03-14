const youtube = require('./services/youtube');
const database = require('./services/database');
const email = require('./services/email');
const videoFilter = require('./filters/videoFilter');
const deduplicator = require('./filters/deduplicator');
const reportFormatter = require('./formatters/reportFormatter');
const logger = require('./utils/logger');
const dateUtils = require('./utils/dateUtils');
const keywords = require('./constants/keywords');

async function run() {
  logger.info('Main', 'Starting daily YouTube Shorts viral detection...');
  
  try {
    await database.initDb();
    
    const publishedAfter = dateUtils.getLast24HoursISO();
    let allVideoIds = [];
    
    // 1. Search for videos by keyword
    for (const keyword of keywords) {
      const videoIds = await youtube.searchShorts(keyword, publishedAfter);
      allVideoIds = [...allVideoIds, ...videoIds];
    }
    
    const totalFound = allVideoIds.length;
    logger.info('Main', `Found ${totalFound} total videos from search.`);
    
    // 2. Get video details (stats)
    const uniqueRawIds = [...new Set(allVideoIds)];
    // Batch in 50s as per YouTube API limits
    let videoDetails = [];
    for (let i = 0; i < uniqueRawIds.length; i += 50) {
      const batch = uniqueRawIds.slice(i, i + 50);
      const batchDetails = await youtube.getVideoDetails(batch);
      videoDetails = [...videoDetails, ...batchDetails];
    }
    
    // 3. Filter videos
    const filteredVideos = videoFilter.filterVideos(videoDetails);
    const totalFiltered = filteredVideos.length;
    logger.info('Main', `Filtered down to ${totalFiltered} videos passing criteria.`);
    
    // 4. Remove duplicates (already reported)
    const uniqueVideos = await deduplicator.removeDuplicates(filteredVideos);
    const duplicatesRemoved = totalFiltered - uniqueVideos.length;
    logger.info('Main', `${uniqueVideos.length} unique videos remaining after deduplication.`);
    
    if (uniqueVideos.length === 0) {
      logger.info('Main', 'No new viral videos found today.');
      // Optionally still send an email or just log and exit
    } else {
      // 5. Save to database
      for (const video of uniqueVideos) {
        await database.saveVideo(video);
      }
      
      // 6. Generate reports
      const stats = { totalFound, totalFiltered, duplicatesRemoved };
      const textReport = reportFormatter.generateTextReport(uniqueVideos, stats);
      const htmlReport = reportFormatter.generateHtmlReport(uniqueVideos, stats);
      
      // 7. Send email
      const subject = `Daily YouTube Shorts Viral Report - ${new Date().toISOString().split('T')[0]}`;
      const success = await email.sendEmailReport(textReport, htmlReport, subject);
      
      if (success) {
        // 8. Mark as reported in DB
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
