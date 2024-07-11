const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

// Configuration
const WINDOW_SIZE = 10;
const SERVER_URLS = {
  'p': 'http://20.244.56.144/test/primes',
  'f': 'http://20.244.56.144/test/fibo',
  'e': 'http://20.244.56.144/test/even',
  'r': 'http://20.244.56.144/test/rand'
};

// State
let window = [];
const lock = {};

// Fetch numbers from the test server
async function fetchNumbers(numberType) {
  const url = SERVER_URLS[numberType];
  if (!url) {
    console.log(`Invalid number type: ${numberType}`);
    return [];
  }

  try {
    console.log(`Fetching numbers from: ${url}`);
    const response = await axios.get(url, { timeout: 500 });
    if (response.status === 200) {
      console.log(`Received data: ${JSON.stringify(response.data)}`);
      return response.data.numbers || [];
    }
  } catch (error) {
    console.error(`Error fetching numbers: ${error.message}`);
    return [];
  }

  return [];
}

// Calculate the average of the current window
function calculateAverage(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

app.get('/numbers/:numberType', async (req, res) => {
  const startTime = Date.now();
  const numberType = req.params.numberType;
  console.log(`Received request for number type: ${numberType}`);

  const newNumbers = await fetchNumbers(numberType);
  console.log(`Fetched new numbers: ${newNumbers}`);

  // Use a lock to ensure thread-safe updates to the window
  if (!lock[numberType]) {
    lock[numberType] = true;

    try {
      const prevWindow = [...window];
      console.log(`Previous window state: ${prevWindow}`);

      // Add unique new numbers to the window
      newNumbers.forEach(number => {
        if (!window.includes(number)) {
          if (window.length >= WINDOW_SIZE) {
            window.shift();
          }
          window.push(number);
        }
      });

      const currentWindow = [...window];
      console.log(`Current window state: ${currentWindow}`);
      const avg = calculateAverage(currentWindow);
      console.log(`Calculated average: ${avg}`);

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > 500) {
        console.log('Request took too long, returning previous state');
        res.json({
          numbers: [],
          windowPrevState: prevWindow,
          windowCurrState: prevWindow,
          avg: calculateAverage(prevWindow)
        });
      } else {
        res.json({
          numbers: newNumbers,
          windowPrevState: prevWindow,
          windowCurrState: currentWindow,
          avg: avg
        });
      }
    } finally {
      lock[numberType] = false;
    }
  } else {
    res.status(503).send('Service Unavailable');
  }
});

app.get('*', (req, res) => {
  res.status(404).send('Endpoint not found');
});

app.listen(port, () => {
  console.log(`Average Calculator microservice running on http://localhost:${port}`);
});