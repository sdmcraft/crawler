import fs from 'fs';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { URL } from 'url';

const visitedUrls = new Set();
const startUrl = 'https://www.sunstar.com/';
const startDomain = new URL(startUrl).hostname;

async function crawlWebsite(url) {

    console.log('Crawling:', url); // Log the current URL being crawled

    try {
        // Save crawled the links to a file
        saveLinksToFile(url);

        if (!url.endsWith('.pdf') && !url.endsWith('docx') && !url.endsWith('mp4')) {
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);

            // Extract links from the webpage
            const links = [];
            $('a').each((index, element) => {
                const href = $(element).attr('href');
                if (href) {
                    links.push(href);
                }
            });

            // Crawl each unvisited link within the same domain recursively
            for (const link of links) {
                let absoluteUrl = new URL(link, url).href;
                if(absoluteUrl.endsWith('/')) {
                    absoluteUrl = absoluteUrl.slice(0, -1);
                }
                if (!visitedUrls.has(absoluteUrl) && new URL(absoluteUrl).hostname === startDomain) {
                    await crawlWithConcurrencyControl(absoluteUrl);
                } else {
                    console.log('Skipping:', absoluteUrl); // Log the skipped URL
                }
            }
        }
    } catch (error) {
        console.error(`Error crawling ${url}:`, error);
    } finally {
        console.log('Crawling completed.'); // Log completion of crawling process
    }
}

// Function to crawl with concurrency control
function crawlWithConcurrencyControl(url) {
    if (visitedUrls.has(url) || new URL(url).hostname !== startDomain || url.includes('#')) {
        return; // Skip crawling if the URL has already been visited or belongs to a different domain or is a anchor link
    }
    visitedUrls.add(url); // Mark the URL as visited
    return new Promise(resolve => {
        setTimeout(() => {
            crawlWebsite(url);
            resolve();
        }, 2000); // Delay for 1 second before retrying
    });
}

// Function to save links to a file
function saveLinksToFile(url) {
    const filename = `${startDomain}_crawled_links.txt`;

    let content = `${url}\n`;

    fs.appendFile(filename, content, (err) => {
        if (err) {
            console.error(`Error saving links to file: ${err}`);
        }
    });
}

// Start crawling
console.log('Crawling started.');
crawlWithConcurrencyControl(startUrl);
