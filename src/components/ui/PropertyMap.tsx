interface PropertyMapProps {
  latitude: number | null
  longitude: number | null
  className?: string
}

export function PropertyMap({
  latitude,
  longitude,
  className = '',
}: PropertyMapProps) {
  if (!latitude || !longitude) {
    return null
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`

  return (
    <div className={`w-full h-64 rounded-lg overflow-hidden ${className}`}>
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        allowFullScreen
      />
    </div>
  )
}
