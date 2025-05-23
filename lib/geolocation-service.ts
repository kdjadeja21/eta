export async function fetchGeolocation() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error("Failed to fetch geolocation data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching geolocation data:", error);
    return null;
  }
}
