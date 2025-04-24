import { useEffect, useState } from 'react'

interface GeocodeResult {
  result: {
    latitude: number | null
    longitude: number | null
    error: string | null
    loading: boolean
  }
  geocodeAddress: (address: string) => Promise<{
    success: boolean
    data?: {
      latitude: number
      longitude: number
    } | null
  }>
}

/**
 * A hook that converts an address to latitude and longitude coordinates using OpenStreetMap Nominatim API
 * @param address The address to geocode
 * @returns An object containing latitude, longitude, error state, and loading state
 */
export function useGeocode(address?: string): GeocodeResult {
  const [result, setResult] = useState<GeocodeResult['result']>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  })

  useEffect(() => {
    if (!address) {
      setResult({
        latitude: null,
        longitude: null,
        error: null,
        loading: false,
      })
      return
    }

    // Add a small delay to prevent too many requests
    const timeoutId = setTimeout(() => geocodeAddress(address), 1000)
    return () => clearTimeout(timeoutId)
  }, [address])

  const geocodeAddress = async (address: string) => {
    setResult((prev) => ({ ...prev, loading: true, error: null }))

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
        setResult({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          error: null,
          loading: false,
        })
        return {
          success: true,
          data: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
          },
        }
      } else {
        setResult({
          latitude: null,
          longitude: null,
          error: 'No results found',
          loading: false,
        })
      }
    } catch (error) {
      setResult({
        latitude: null,
        longitude: null,
        error:
          error instanceof Error ? error.message : 'Failed to geocode address',
        loading: false,
      })
    }

    return {
      success: false,
      error: 'No results found',
    }
  }

  return { result, geocodeAddress }
}
