
# Armenia EV Charge Map

This application displays electric vehicle charging stations across Armenia on an interactive map.

## Data Sources

The application uses data from:
- Team Energy
- Evan Charge

## How to Update JSON Data

To update the charging station data:

1. Run the data processor script:

```bash
node src/services/dataProcessor.js
```

This will:
- Fetch fresh data from Team Energy and Evan Charge APIs
- Process the data and save it to JSON files in the `public/data` directory
- The frontend will then read from these local JSON files, avoiding CORS issues

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Features

- Interactive map of charging stations across Armenia
- Filtering by connector type, power, and availability
- Detailed information for each charging station
