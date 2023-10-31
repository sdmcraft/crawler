const urlTable = document.getElementById('urlTable');
const loadingSpinner = document.getElementById('loadingSpinner');
const crawlingCompleteMessage = document.getElementById('crawlingCompleteMessage');
const visitedUrls = new Set();
let startDomain = '';

document.getElementById('crawlerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const startUrl = document.getElementById('startUrl').value;
    if (startUrl) {
        loadingSpinner.style.display = 'block';
        crawlingCompleteMessage.style.display = 'none';
        startDomain = new URL(startUrl).hostname; // Set startDomain here
        console.log('Starting crawl process for:', startUrl);
        await crawlWithStartUrl(startUrl);
        loadingSpinner.style.display = 'none';
        crawlingCompleteMessage.style.display = 'block';
        console.log('Crawl process completed.');
    }
});

async function crawlWithStartUrl(url) {
    addUrlToTable(url);
    await crawlWebsite(url);

    console.log('Crawling completed for:', url);
}

async function crawlWebsite(url) {
    try {
        if (!url.endsWith('.pdf') && !url.endsWith('docx') && !url.endsWith('mp4')) {
            const response = await fetch(url);
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const links = Array.from(doc.querySelectorAll('a')).map(element => element.getAttribute('href'));

            for (const link of links) {
                let absoluteUrl = new URL(link, url).href;
                if (absoluteUrl.endsWith('/')) {
                    absoluteUrl = absoluteUrl.slice(0, -1);
                }
                if (!visitedUrls.has(absoluteUrl) && new URL(absoluteUrl).hostname === startDomain) {
                    await crawlWithConcurrencyControl(absoluteUrl);
                } else {
                    console.log('Skipping:', absoluteUrl);
                }
            }
        }
    } catch (error) {
        console.error(`Error crawling ${url}:`, error);
    }
}

async function crawlWithConcurrencyControl(url) {
    if (visitedUrls.has(url) || new URL(url).hostname !== startDomain || url.includes('#')) {
        return;
    }
    visitedUrls.add(url);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await crawlWebsite(url);
}

function addUrlToTable(url) {
    const row = urlTable.insertRow();
    const cell = row.insertCell(0);
    cell.textContent = url;
}

function sortTable(column) {
    const rows = Array.from(urlTable.rows);
    const headerCell = rows[0].cells[column];

    rows.sort((rowA, rowB) => {
        const textA = rowA.cells[column].textContent;
        const textB = rowB.cells[column].textContent;
        return textA.localeCompare(textB);
    });

    rows.forEach((row, index) => {
        if (index === 0) {
            return; // Skip header row
        }
        urlTable.appendChild(row);
    });

    headerCell.classList.toggle('sorted');
}

console.log('Crawler script loaded.');
