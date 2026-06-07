import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import Itinerary from '../models/Itinerary.js';
import { extractBookingData, generateItinerary } from '../utils/geminiService.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

const sendInvalidId = (res) =>
  res.status(400).json({ message: 'Invalid itinerary ID' });

/**
 * Upload files and generate itinerary using AI
 * POST /api/itineraries/generate
 * Protected route - requires authentication
 */
export const uploadAndGenerate = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: 'Please upload at least one file (PDF or image)' });
    }

    // Extract file URLs and metadata from Cloudinary upload
    const documents = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      fileType: file.mimetype,
    }));

    const fileUrls = documents.map((doc) => doc.url);

    const aiExtractedData = await extractBookingData(fileUrls);
    const extractedData = {
      ...aiExtractedData,
      destination: req.body.destination || aiExtractedData.destination,
      departureDate: req.body.startDate || aiExtractedData.departureDate,
      returnDate: req.body.endDate || aiExtractedData.returnDate,
      preferences: req.body.preferences || null,
    };

    const itinerary = await generateItinerary(extractedData);

    const newItinerary = await Itinerary.create({
      userId: req.user._id,
      title: itinerary.title || `Trip - ${new Date().toLocaleDateString()}`,
      documents,
      extractedData,
      itinerary,
      shareToken: randomUUID(),
      isPublic: false,
    });

    res.status(201).json({
      success: true,
      data: newItinerary,
    });
  } catch (error) {
    console.error('Error in uploadAndGenerate:', error);
    res.status(500).json({
      message: 'Failed to generate itinerary',
      error: error?.message || String(error),
    });
  }
};

/**
 * Get all itineraries for the logged-in user
 * GET /api/itineraries
 * Protected route - requires authentication
 */
export const getMyItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user._id })
      .select('-extractedData') // Exclude raw extracted data to reduce response size
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: itineraries.length,
      data: itineraries,
    });
  } catch (error) {
    console.error('Error in getMyItineraries:', error);
    res.status(500).json({
      message: 'Failed to fetch itineraries',
      error: error.message,
    });
  }
};

/**
 * Get a single itinerary by ID
 * GET /api/itineraries/:id
 * Protected route - requires authentication and ownership verification
 */
export const getItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return sendInvalidId(res);

    const itinerary = await Itinerary.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!itinerary) {
      return res
        .status(404)
        .json({ message: 'Itinerary not found or access denied' });
    }

    res.status(200).json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    console.error('Error in getItinerary:', error);
    res.status(500).json({
      message: 'Failed to fetch itinerary',
      error: error.message,
    });
  }
};

/**
 * Get a shared itinerary by share token (PUBLIC route)
 * GET /api/itineraries/share/:shareToken
 * No authentication required
 */
export const shareItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return sendInvalidId(res);

    const itinerary = await Itinerary.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!itinerary) {
      return res
        .status(404)
        .json({ message: 'Itinerary not found or access denied' });
    }

    itinerary.isPublic = true;
    await itinerary.save();

    res.status(200).json({
      success: true,
      data: { shareToken: itinerary.shareToken },
    });
  } catch (error) {
    console.error('Error in shareItinerary:', error);
    res.status(500).json({
      message: 'Failed to share itinerary',
      error: error.message,
    });
  }
};

export const claimItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const { shareToken } = req.body;
    if (!isValidId(id)) return sendInvalidId(res);

    if (!shareToken) {
      return res.status(400).json({ message: 'Share token is required' });
    }

    const original = await Itinerary.findOne({
      _id: id,
      shareToken,
      isPublic: true,
    });

    if (!original) {
      return res
        .status(404)
        .json({ message: 'Shared itinerary not found or is not public' });
    }

    const copy = await Itinerary.create({
      userId: req.user._id,
      title: original.title,
      documents: original.documents,
      extractedData: original.extractedData,
      itinerary: original.itinerary,
      shareToken: randomUUID(),
      isPublic: false,
    });

    res.status(201).json({
      success: true,
      data: { itineraryId: copy._id },
    });
  } catch (error) {
    console.error('Error in claimItinerary:', error);
    res.status(500).json({
      message: 'Failed to claim itinerary',
      error: error.message,
    });
  }
};

export const getSharedItinerary = async (req, res) => {
  try {
    const { shareToken } = req.params;

    const itinerary = await Itinerary.findOne({
      shareToken,
      isPublic: true,
    })
      .select('-extractedData')
      .populate('userId', 'name email');

    if (!itinerary) {
      return res
        .status(404)
        .json({ message: 'Shared itinerary not found or is not public' });
    }

    const owner = itinerary.userId
      ? { name: itinerary.userId.name, email: itinerary.userId.email }
      : null;

    res.status(200).json({
      success: true,
      data: itinerary,
      owner,
    });
  } catch (error) {
    console.error('Error in getSharedItinerary:', error);
    res.status(500).json({
      message: 'Failed to fetch shared itinerary',
      error: error.message,
    });
  }
};

/**
 * Delete an itinerary
 * DELETE /api/itineraries/:id
 * Protected route - requires authentication and ownership verification
 */
export const deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return sendInvalidId(res);

    const itinerary = await Itinerary.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!itinerary) {
      return res
        .status(404)
        .json({ message: 'Itinerary not found or access denied' });
    }

    res.status(200).json({
      success: true,
      message: 'Itinerary deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteItinerary:', error);
    res.status(500).json({
      message: 'Failed to delete itinerary',
      error: error.message,
    });
  }
};
