export async function fetchUrls(indexUrl, responseParser) {
  const response = await fetch(indexUrl);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const content = await response.json();
  // console.log('here is the content' +  JSON.stringify(content.data, null, 2));
  const urls = responseParser(content, indexUrl);
  return urls;
}

export function franklinIndexParser(content, indexUrl) {
  const origin = new URL(indexUrl).origin;
  return content.data.map((child) => origin + child.path);
}

export function convertJSONToCSV(data) {
  const separator = ',';
  const keys = Object.keys(data[0]);
  const csvContent = [keys.join(separator)];

  data.forEach((item) => {
    const values = keys.map((key) => {
      const value = item[key];
      return typeof value === 'string' ? `"${value}"` : value;
    });
    csvContent.push(values.join(separator));
  });

  return csvContent.join('\n');
}
