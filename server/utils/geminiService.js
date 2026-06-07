import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRequiredEnv } from '../config/env.js';

let model;

const getModel = () => {
  if (!model) {
    const genAI = new GoogleGenerativeAI(
      getRequiredEnv('GOOGLE_GENERATIVE_AI_API_KEY')
    );
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  return model;
};

const getMimeType = (fileUrl, contentType) => {
  const lowerUrl = fileUrl.toLowerCase();

  if (lowerUrl.includes('.pdf')) return 'application/pdf';
  if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg')) return 'image/jpeg';
  if (lowerUrl.includes('.png')) return 'image/png';
  if (lowerUrl.includes('.webp')) return 'image/webp';
  if (contentType && contentType !== 'application/octet-stream') return contentType;

  return 'application/pdf';
};

const parseJsonResponse = (text, fallbackMessage) => {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(`${fallbackMessage}: ${error.message}`);
    throw new Error(fallbackMessage);
  }
};

export const extractBookingData = async (fileUrls) => {
  const parts = [];

  const prompt =
    'Extract all travel booking information from these documents. Return structured JSON with fields: travelerName, origin, destination, departureDate, returnDate, flightNumber, airline, hotelName, hotelAddress, checkIn, checkOut, bookingReference, additionalInfo. If a field is not found, set it to null. Return only the JSON object.';

  for (const fileUrl of fileUrls) {
    try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(`File request failed with ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      const buffer = await response.arrayBuffer();

      parts.push({
        inlineData: {
          data: Buffer.from(buffer).toString('base64'),
          mimeType: getMimeType(fileUrl, contentType),
        },
      });
    } catch (error) {
      console.error(`Could not read uploaded file ${fileUrl}: ${error.message}`);
    }
  }

  if (parts.length === 0) {
    throw new Error('No valid files to process');
  }

  const result = await getModel().generateContent([prompt, ...parts]);
  const response = await result.response;

  return parseJsonResponse(
    response.text(),
    'Failed to parse extracted booking data'
  );
};

export const generateItinerary = async (extractedData) => {
  const prompt = `You are a travel planning expert. Based on this booking information: ${JSON.stringify(
    extractedData,
    null,
    2
  )}, create a detailed day-by-day travel itinerary. Return JSON with this structure: { "title": string, "summary": string, "days": [{ "day": number, "date": string, "title": string, "description": string, "activities": [{ "time": string, "name": string, "location": string, "tips": string, "duration": string, "cost": string }] }], "travelTips": string[], "emergencyContacts": object }. Make the itinerary practical and include local attractions, restaurants, and activities near the hotel. Return only the JSON object.`;

  const result = await getModel().generateContent([prompt]);
  const response = await result.response;

  return parseJsonResponse(response.text(), 'Failed to parse itinerary');
};
