
# Armenia EV Charge Map

This application displays electric vehicle charging stations across Armenia on an interactive map.

## Data Sources

The application uses data from two API providers:
- Team Energy
- Evan Charge

## How to Update JSON Data

To update the charging station data:

1. Run the data processor script:

```bash
# Navigate to the project root
cd [project-directory]

# Run the data processor script
node -r ts-node/register src/services/dataProcessor.ts
```

This will:
- Fetch fresh data from Team Energy and Evan Charge APIs
- Process the data and save it to JSON files in the `public/data` directory
- The frontend will then read from these local JSON files, avoiding CORS issues

Note: The script requires Node.js and ts-node installed. If ts-node is not installed, you can install it with `npm install -g ts-node`.

## API Endpoints Used

### Team Energy
- Authentication: `https://api.teamenergy.am/UserManagement/Login`
- Chargers: `https://api.teamenergy.am/api/v1/charging-stations`

### Evan Charge
- Authentication: `https://evcharge-api-prod.e-evan.com/api/users/auth/signin`
- Chargers: `https://evcharge-api-prod.e-evan.com/api/stations/stations?_limit=1000&_offset=0&includePricing=is_equal:%22true%22`

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
