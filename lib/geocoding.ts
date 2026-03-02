interface GeocodeResult {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(
  address: string,
  city: string
): Promise<GeocodeResult | null> {
  const query = `${address}, ${city}, Israel`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AgalApp",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.length === 0) {
      return null;
    }

    const { lat, lon } = data[0];
    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    };
  } catch {
    return null;
  }
}
