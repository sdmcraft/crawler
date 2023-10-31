import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { convertJSONToCSV, fetchUrls, franklinIndexParser } from './utils.js';

async function computLHS(url) {
  console.log('Computing LHS for:', url);
  // Launch a headless Chrome instance
  const chrome = await launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices'], // You can add more categories here if needed
    port: chrome.port,
  };

  // Run Lighthouse
  const report = await lighthouse(url, options);

  const result = {
    url,
    performanceScore: report.lhr.categories.performance.score * 100,
    accessibilityScore: report.lhr.categories.accessibility.score * 100,
    bestPracticesScore: report.lhr.categories['best-practices'].score * 100,
  };

  console.log(JSON.stringify(result, null, 2));

  // Close the Chrome instance
  await chrome.kill();
  return result;
}

const urls = await fetchUrls('https://main--sunstar-engineering--hlxsites.hlx.live/query-index.json', franklinIndexParser);
const results = [];
let i = 0;
for (const url of urls) {
    results.push(await computLHS(url));
    i++;
    if (i > 5) {
        break;
    }
}

const csv = convertJSONToCSV(results);
console.log(csv);
