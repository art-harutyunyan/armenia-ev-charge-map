
import { ChargingStation } from "@/types/chargers";
import { ApiResponse, AuthResponse, RawEvanChargeStation } from "./types";
import { convertEvanChargeToStandardFormat } from "@/utils/dataConverters";
import { proxyFetch } from "./proxy";

const BASE_URL = "https://evcharge-api-prod.e-evan.com";

export async function authenticateEvanCharge(): Promise<ApiResponse<string>> {
  console.log("Authenticating with Evan Charge...");
  try {
    const response = await proxyFetch(`${BASE_URL}/api/users/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: "+37493709944",
        password: "P0ker123$5!",
      }),
    });

    console.log("Evan Charge auth response:", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Evan Charge auth error:", errorText);
      return {
        success: false,
        error: `Authentication failed: ${response.status} ${errorText}`,
      };
    }

    const data: AuthResponse = await response.json();
    console.log("Evan Charge auth successful, token retrieved:", data);
    return { success: true, data: data.token["accessToken"] };
  } catch (error) {
    console.error("Evan Charge auth exception:", error);
    return { success: false, error: `Authentication exception: ${error}` };
  }
}

export async function fetchEvanChargeChargers(
  token: string
): Promise<ApiResponse<ChargingStation[]>> {
  console.log("Fetching Evan Charge chargers...");
  try {
    const response = await proxyFetch(
      `${BASE_URL}/api/stations/stations?_limit=1000&_offset=0&includePricing=is_equal:%22true%22`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Evan Charge chargers response:", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Evan Charge chargers error:", errorText);
      return {
        success: false,
        error: `Failed to fetch chargers: ${response.status} ${errorText}`,
      };
    }

    const data: RawEvanChargeStation[] = await response.json();
    console.log(`Evan Charge chargers fetched:`, data);

    const standardizedChargers = data.map((station) =>
      convertEvanChargeToStandardFormat(station)
    );

    return { success: true, data: standardizedChargers };
  } catch (error) {
    console.error("Evan Charge chargers exception:", error);
    return { success: false, error: `Fetch exception: ${error}` };
  }
}
