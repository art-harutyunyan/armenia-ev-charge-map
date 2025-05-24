
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { fetchTeamEnergyData, fetchEvanChargeData } = require("./api");

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend requests
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Endpoint to get the current charging station data
app.get("/api/data", (req, res) => {
  try {
    const teamEnergyPath = path.join(
      __dirname,
      "../public/data/teamEnergy.json"
    );
    const evanChargePath = path.join(
      __dirname,
      "../public/data/evanCharge.json"
    );

    console.log("Checking for data files...");
    console.log("Team Energy path:", teamEnergyPath);
    console.log("Evan Charge path:", evanChargePath);

    // Check if both files exist
    if (fs.existsSync(teamEnergyPath)) {
      console.log("Reading Team Energy data...");
      const teamEnergy = JSON.parse(fs.readFileSync(teamEnergyPath, "utf8"));
      console.log(`Loaded ${teamEnergy.length || 0} Team Energy stations`);
      
      let evanCharge = [];
      if (fs.existsSync(evanChargePath)) {
        console.log("Reading Evan Charge data...");
        evanCharge = JSON.parse(fs.readFileSync(evanChargePath, "utf8"));
        console.log(`Loaded ${evanCharge.length || 0} Evan Charge stations`);
      }

      return res.json({
        teamEnergy,
        evanCharge,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      console.log("Data files don't exist, attempting to refresh...");
      // If files don't exist, attempt to refresh the data first
      return refreshData(req, res);
    }
  } catch (error) {
    console.error("Error serving data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve charging station data",
    });
  }
});

// Endpoint to refresh the data from APIs
app.get("/api/refresh", refreshData);

async function refreshData(req, res) {
  console.log("Starting data refresh process...");
  try {
    // Create the data directory if it doesn't exist
    const dataDir = path.join(__dirname, "../public/data");
    if (!fs.existsSync(dataDir)) {
      console.log("Creating data directory...");
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Fetch data from both APIs
    console.log("Fetching Team Energy data...");
    const teamEnergyData = await fetchTeamEnergyData();

    if (!teamEnergyData.success) {
      console.error("Team Energy fetch failed:", teamEnergyData.error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch Team Energy data",
        details: teamEnergyData.error,
      });
    }

    // Save TeamEnergy data to JSON file
    const teamEnergyPath = path.join(
      __dirname,
      "../public/data/teamEnergy.json"
    );

    console.log("Saving Team Energy data...");
    console.log("Data to save:", JSON.stringify(teamEnergyData.data, null, 2));
    
    fs.writeFileSync(
      teamEnergyPath,
      JSON.stringify(teamEnergyData.data, null, 2)
    );

    console.log("Data refresh complete!");
    res.json({
      success: true,
      message: "Data successfully refreshed",
      timestamp: new Date().toISOString(),
      stats: {
        teamEnergy: { stations: teamEnergyData.data?.length || 0 },
      },
    });
  } catch (error) {
    console.error("Error refreshing data:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to refresh data from APIs" });
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
