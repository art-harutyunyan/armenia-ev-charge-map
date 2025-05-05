
import { ChargingStation } from "@/types/chargers";
import { ApiResponse, AuthResponse, RawTeamEnergyStation } from "./types";
import { convertTeamEnergyToStandardFormat } from "@/utils/dataConverters";
import { proxyFetch } from "./proxy";

const BASE_URL = "https://api.teamenergy.am";

export async function authenticateTeamEnergy(): Promise<ApiResponse<string>> {
  console.log("Authenticating with Team Energy...");
  try {
    const response = await proxyFetch(`${BASE_URL}/UserManagement/Login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        guestMode: false,
        password: "P0ker123$5!",
        phoneNumber: "+37493709944",
      }),
    });

    console.log("Team Energy auth response:", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Team Energy auth error:", errorText);
      return {
        success: false,
        error: `Authentication failed: ${response.status} ${errorText}`,
      };
    }

    const data: AuthResponse = await response.json();
    console.log("Team Energy auth successful, token retrieved:", data);
    return { success: true, data: data["access_token"] };
  } catch (error) {
    console.error("Team Energy auth exception:", error);
    return { success: false, error: `Authentication exception: ${error}` };
  }
}

export async function fetchTeamEnergyChargers(
  token: string
): Promise<ApiResponse<ChargingStation[]>> {
  console.log("Fetching Team Energy chargers...");
  try {
    const response = await proxyFetch(`${BASE_URL}/api/v1/charging-stations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Team Energy chargers response:", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Team Energy chargers error:", errorText);
      return {
        success: false,
        error: `Failed to fetch chargers: ${response.status} ${errorText}`,
      };
    }

    const data: { chargers: RawTeamEnergyStation[] } = await response.json();
    console.log(`Team Energy chargers fetched:`, data);

    const standardizedChargers = data.chargers.map((station) =>
      convertTeamEnergyToStandardFormat(station)
    );

    return { success: true, data: standardizedChargers };
  } catch (error) {
    console.error("Team Energy chargers exception:", error);
    return { success: false, error: `Fetch exception: ${error}` };
  }
}
