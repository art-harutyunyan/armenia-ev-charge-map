
# Armenia EV Charge Map

This application displays electric vehicle charging stations across Armenia on an interactive map.

## Project Structure

The project consists of:

- A React frontend for displaying the charging stations on a map
- A Node.js backend server for fetching and storing data from the APIs

## Data Sources

The application uses data from two API providers:
- Team Energy
- Evan Charge

## Running the Application

### Backend Server

First, start the backend server:

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm start
```

The server will run on port 3001 by default.

### Frontend Application

In another terminal, start the frontend:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## How the Data Flow Works

1. The backend server fetches data from Team Energy and Evan Charge APIs
2. The data is stored as JSON files in the `public/data` directory
3. The frontend reads this data to display the charging stations on the map
4. The "Refresh Data" button in the Debug Panel triggers the backend to fetch fresh data

## API Endpoints

### Backend API:

- `GET /api/data` - Get the current charging station data
- `GET /api/refresh` - Trigger a refresh of data from the source APIs

### External APIs:

#### Team Energy
- Authentication: `https://api.teamenergy.am/UserManagement/Login`
- Chargers: `https://api.teamenergy.am/ChargePoint/search` (POST with body: `{"noLatest": 1}`)

#### Evan Charge
- Authentication: `https://evcharge-api-prod.e-evan.com/api/users/auth/signin`
- Chargers: `https://evcharge-api-prod.e-evan.com/api/stations/stations?_limit=1000&_offset=0&includePricing=is_equal:%22true%22`

## Features

- Interactive map of charging stations across Armenia
- Filtering by connector type, power, and availability
- Detailed information for each charging station
- Debug panel to manually refresh data from APIs

## Configuration

The Mapbox token is configured in `src/config/mapbox.ts`.

