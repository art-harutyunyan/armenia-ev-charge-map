const axios = require("axios");

// API configurations
const TEAM_ENERGY_AUTH_URL = "https://api.teamenergy.am/UserManagement/Login";
const TEAM_ENERGY_CHARGERS_URL = "https://api.teamenergy.am/ChargePoint/search";
const EVAN_CHARGE_AUTH_URL =
  "https://evcharge-api-prod.e-evan.com/api/users/auth/signin";
const EVAN_CHARGE_CHARGERS_URL =
  "https://evcharge-api-prod.e-evan.com/api/stations/stations?_limit=1000&_offset=0&includePricing=is_equal:%22true%22";

// Fetch and process Team Energy data with new structure
async function fetchTeamEnergyData() {
  try {
    console.log("Authenticating with Team Energy API...");
    const authResponse = await axios.post(
      TEAM_ENERGY_AUTH_URL,
      {
        guestMode: false,
        password: "P0ker123$5!",
        phoneNumber: "+37493709944",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Team Energy auth response status:", authResponse.status);
    if (authResponse.status !== 200) {
      return {
        success: false,
        error: `Team Energy authentication failed with status ${authResponse.status}`,
      };
    }

    const accessToken = authResponse.access_token;
    console.log("Team Energy authentication successful, token retrieved");

    // Fetch chargers
    console.log("Fetching Team Energy chargers...");
    const chargersResponse = await axios.post(
      TEAM_ENERGY_CHARGERS_URL,
      {
        noLatest: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Team Energy chargers response status:",
      chargersResponse.status
    );
    if (chargersResponse.status !== 200) {
      return {
        success: false,
        error: `Team Energy chargers fetch failed with status ${chargersResponse.status}`,
      };
    }

    const rawData = chargersResponse.data;
    console.log(
      `Retrieved ${rawData.chargers?.length || 0} Team Energy chargers`
    );

    // Convert to the new structure
    const convertedChargers = rawData.chargers.map((station) => ({
      chargePointId: station.chargePointId,
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      address: station.address,
      phone: station.phone || "",
      chargePointInfos: station.chargePointInfos.map((info) => ({
        chargePointId: info.chargePointId,
        isSeperated: info.isSeperated,
        stationNumber: info.stationNumber,
        connectors: info.connectors.map((connector) => ({
          connectorId: connector.connectorId,
          key: connector.key,
          connectorType: connector.connectorType,
          connectorTypeGroup: connector.connectorTypeGroup,
          power: connector.power,
          statusDescription: connector.statusDescription,
          status: connector.status,
          isPrepairing: connector.isPrepairing,
          price: connector.price,
          stateOfBattery: connector.stateOfBattery,
        })),
      })),
    }));

    const formattedData = {
      chargers: convertedChargers,
    };

    console.log(
      "Sample converted Team Energy charger:",
      JSON.stringify(convertedChargers[0], null, 2)
    );

    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    console.error("Failed to fetch Team Energy data:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return {
      success: false,
      error: `Team Energy API error: ${error.message}`,
    };
  }
}

// Fetch and process Evan Charge data
async function fetchEvanChargeData() {
  try {
    console.log("Authenticating with Evan Charge API...");
    const authResponse = await axios.post(
      EVAN_CHARGE_AUTH_URL,
      {
        phone: "+37493709944",
        password: "P0ker123$5!",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Evan Charge auth response status:", authResponse.status);
    if (authResponse.status !== 200) {
      return {
        success: false,
        error: `Evan Charge authentication failed with status ${authResponse.status}`,
      };
    }

    const accessToken = authResponse.data.token.accessToken;
    console.log("Evan Charge authentication successful, token retrieved");

    // Fetch chargers
    console.log("Fetching Evan Charge chargers...");
    const chargersResponse = await axios.get(EVAN_CHARGE_CHARGERS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log(
      "Evan Charge chargers response status:",
      chargersResponse.status
    );
    if (chargersResponse.status !== 200) {
      return {
        success: false,
        error: `Evan Charge chargers fetch failed with status ${chargersResponse.status}`,
      };
    }

    const chargersData = chargersResponse.data;
    console.log(`Retrieved ${chargersData?.length || 0} Evan Charge chargers`);

    if (chargersData && chargersData.length > 0) {
      console.log(
        "Sample Evan Charge charger:",
        JSON.stringify(chargersData[0], null, 2)
      );
    }

    // Format the data to match the expected structure
    const formattedData = {
      data: chargersData,
    };

    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    console.error("Failed to fetch Evan Charge data:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return {
      success: false,
      error: `Evan Charge API error: ${error.message}`,
    };
  }
}

module.exports = {
  fetchTeamEnergyData,
  fetchEvanChargeData,
};
