import puppeteer from "puppeteer";
import fs from "fs";

async function fetchUrl(url, selector) {
  console.log('Fetching:', url);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  // await page.waitForLoadState('networkidle');
  let source = await page.content({"waitUntil": "domcontentloaded"});
  // console.log(source);
  // const matchingElements = await page.$$(selector);
  await browser.close();
  //return matchingElements.length > 0;
  return source.includes('https://sunstar-engineering.com');
}




async function saveLinksToFile(url) {
  const filename = 'crawled_links.txt';
  let content = `${url}\n`;
  fs.appendFile(filename, content, (err) => {
    if (err) {
      console.error(`Error saving links to file: ${err}`);
    }
  });
}

async function handleRequest(request) {
  const { indexUrl, cssSelector, mode } = await request.json();
  await find(indexUrl, cssSelector, mode);
}

async function find(indexUrl, cssSelector, mode) {
  try {
    const urls = await fetchUrls(indexUrl, franklinIndexParser);
    urls.forEach((url) => {
      fetchUrl(url, cssSelector).then((hasElement) => {
        if (hasElement) {
          console.log('Found:', url);
          saveLinksToFile(url);
        }
      });
    });
    return new Response(JSON.stringify({ urls }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching URLs:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while fetching the URLs.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

await find('https://main--sunstar-engineering--hlxsites.hlx.page/query-index.json', 'a', 'franklin');
