const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

function generateTextReport(videos, stats) {
  let report = `Daily Shorts Viral Report\n${new Date().toISOString().split('T')[0]}\n\n`;
  report += `📊 SUMMARY\n- Videos Found: ${stats.totalFound}\n- Videos Filtered: ${stats.totalFiltered}\n- Duplicates Removed: ${stats.duplicatesRemoved}\n\n`;
  
  videos.forEach((v, i) => {
    report += `${i + 1}. ${v.title}\n`;
    report += `   Channel: ${v.channelTitle}\n`;
    report += `   Views: ${v.viewCount.toLocaleString()}\n`;
    report += `   Likes: ${v.likeCount.toLocaleString()}\n`;
    report += `   Like Ratio: ${v.likeRatio}%\n`;
    report += `   Link: ${v.videoUrl}\n\n`;
  });
  
  return report;
}

function generateHtmlReport(videos, stats) {
  const templateSource = fs.readFileSync(path.join(__dirname, 'emailTemplate.hbs'), 'utf8');
  const template = Handlebars.compile(templateSource);
  
  return template({
    date: new Date().toISOString().split('T')[0],
    videos,
    stats
  });
}

module.exports = {
  generateTextReport,
  generateHtmlReport
};
