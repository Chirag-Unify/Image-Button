import * as fs from 'fs';
import * as path from 'path';

const UNIFY_API_URL = 'https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details';
const FIGMA_URL = 'https://www.figma.com/design/gnNvVdYstXaArQ0zpNGpsK/SaS-Employee-Management-App?node-id=55-61114&t=g6w6B1x5SPaQnPzq-4';

type FigmaApiResponse = any; // You can replace 'any' with a more specific type if you know the structure

async function fetchFigmaData(): Promise<void> {
  const data = { fileUrl: FIGMA_URL };

  try {
    const response = await fetch(UNIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const figmaJson: FigmaApiResponse = await response.json();
    fs.writeFileSync('figma.json', JSON.stringify(figmaJson, null, 2), 'utf8');
    console.log('Figma data saved to figma.json');
  } catch (error) {
    console.error('Error fetching Figma data:', error);
    process.exit(1);
  }
}

fetchFigmaData(); 