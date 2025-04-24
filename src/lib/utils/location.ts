export const geocodeAddress = async (address: string) => {
  try {
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'InmoApp/1.0', // Required by Nominatim's usage policy
        },
      },
    )

    if (!response.ok) {
      throw new Error('Failed to geocode address')
    }

    const data = await response.json()

    if (data && data.length > 0) {
      const { lat, lon } = data[0]
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        error: null,
        loading: false,
      }
    } else {
      return {
        latitude: null,
        longitude: null,
      }
    }
  } catch (error) {
    return {
      latitude: null,
      longitude: null,
    }
  }
}
