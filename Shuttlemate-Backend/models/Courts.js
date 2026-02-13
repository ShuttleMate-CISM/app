import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const connection = mongoose.connection;
const AutoIncrement = AutoIncrementFactory(connection);

const CourtAvailabilitySchema = new mongoose.Schema({
   dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  startTime: {
    type: String, 
    required: true,
  },
  endTime: {
    type: String, 
    required: true,
  },
  isRecurring: {
    type: Boolean,
    default: true,
  }
})

const BookingCourtSchema = new mongoose.Schema({
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, 
      required: true,
    },
    endTime: {
      type: String, 
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courts",
    },
    notes: {
      type: String,
    }
}, { timestamps: true });

const CourtsSchema = new mongoose.Schema(
  {
    CourtPhoto: {
      type: String,
      required: true,
    },
    CourtName: {
      type: String,
      required: true,
    },
    Tel: {
      type: String,
    },
    place: {
      type: String,
      required: true,
    },
    Priceperhour:{
      type: Number,
      required: true,
    },
    Openinghours:{
      type : String,
      required: true,
    },
    Directions: [
      {
        latitude: {
          type: String,
          required: true,
        },
        longitude: {
          type: String,
          required: true ,
        },
      },
    ],
    availability: [CourtAvailabilitySchema],
    bookings: [BookingCourtSchema],
  },
  { timestamps: true, } 
);


export const CourtAvailabilitySlot = mongoose.model("CourtAvailabilitySlot", CourtAvailabilitySchema);
export const CourtBooking = mongoose.model("CourtBooking", BookingCourtSchema);
export default mongoose.model("Courts", CourtsSchema);
