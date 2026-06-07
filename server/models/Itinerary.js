import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    title: {
      type: String,
      trim: true,
    },
    documents: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          required: true,
        },
      },
    ],
    extractedData: {
      type: Object,
      default: {},
    },
    itinerary: {
      type: Object,
      default: {},
    },
    shareToken: {
      type: String,
      unique: true,
      default: nanoid,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;