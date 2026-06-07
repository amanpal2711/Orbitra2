import express from 'express';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  uploadAndGenerate,
  getMyItineraries,
  getItinerary,
  getSharedItinerary,
  deleteItinerary,
  shareItinerary,
  claimItinerary,
} from '../controllers/itineraryController.js';

const router = express.Router();

/**
 * @route   POST /api/itineraries/generate
 * @desc    Upload files and generate AI-powered itinerary
 * @access  Private (requires authentication)
 * @body    Multipart form with 'documents' field containing files
 */
router.post(
  '/generate',
  protect,
  upload.array('documents', 5),
  uploadAndGenerate
);

/**
 * @route   GET /api/itineraries
 * @desc    Get all itineraries for logged-in user
 * @access  Private (requires authentication)
 */
router.get('/', protect, getMyItineraries);

/**
 * @route   GET /api/itineraries/share/:shareToken
 * @desc    Get a shared itinerary by share token (PUBLIC - no auth required)
 * @access  Public
 */
router.get('/share/:shareToken', getSharedItinerary);

/**
 * @route   POST /api/itineraries/:id/share
 * @desc    Enable sharing and return share token
 * @access  Private
 */
router.post('/:id/share', protect, shareItinerary);

/**
 * @route   POST /api/itineraries/:id/claim
 * @desc    Copy a shared itinerary to the logged-in user
 * @access  Private
 */
router.post('/:id/claim', protect, claimItinerary);

/**
 * @route   GET /api/itineraries/:id
 * @desc    Get a single itinerary by ID (verify ownership)
 * @access  Private (requires authentication)
 */
router.get('/:id', protect, getItinerary);

/**
 * @route   DELETE /api/itineraries/:id
 * @desc    Delete an itinerary (verify ownership)
 * @access  Private (requires authentication)
 */
router.delete('/:id', protect, deleteItinerary);

export default router;