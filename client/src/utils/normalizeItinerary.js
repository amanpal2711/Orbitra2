/**
 * Maps a MongoDB itinerary document to the shape expected by UI pages.
 */
export function normalizeItinerary(record) {
  if (!record) return null

  const extracted = record.extractedData || {}
  const generated = record.itinerary || {}
  const days = generated.days || []
  const recommendations = generated.recommendations || {}

  const firstDay = days[0]
  const lastDay = days[days.length - 1]

  const startDate =
    extracted.departureDate ||
    extracted.checkIn ||
    firstDay?.date ||
    record.createdAt

  const endDate =
    extracted.returnDate ||
    extracted.checkOut ||
    lastDay?.date ||
    record.createdAt

  const destination =
    extracted.destination ||
    generated.title ||
    record.title ||
    'Untitled trip'

  return {
    _id: record._id,
    shareToken: record.shareToken,
    title: record.title || generated.title || destination,
    destination,
    startDate,
    endDate,
    days: days.map((day) => ({
      ...day,
      activities: (day.activities || []).map((activity) => ({
        ...activity,
        name: activity.name || activity.activity || 'Activity',
      })),
    })),
    summary: generated.summary,
    recommendations,
    travelTips: generated.travelTips,
    emergencyContacts: generated.emergencyContacts,
    preferences: extracted.preferences,
    travelerName: extracted.travelerName,
    airline: extracted.airline,
    flightNumber: extracted.flightNumber,
    hotel: extracted.hotelName,
    hotelAddress: extracted.hotelAddress,
    checkIn: extracted.checkIn,
    checkOut: extracted.checkOut,
    bookingReference: extracted.bookingReference,
    budget: generated.budget,
    documents: record.documents || [],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

/** Unwrap `{ success, data }` API responses from axios. */
export function unwrapApiData(response) {
  const body = response?.data
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    ('success' in body || 'count' in body)
  ) {
    return body.data
  }
  return body
}
