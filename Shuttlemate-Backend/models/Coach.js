import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const connection = mongoose.connection; 
const AutoIncrement = AutoIncrementFactory(connection);

const AvailabilitySlotSchema = new mongoose.Schema({
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
});

const BookingSchema = new mongoose.Schema({
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


const CoachSchema = new mongoose.Schema(
  {
    CoachPhoto: {
      type: String,
      required: true,
    },
    CoachName: {
      type: String,
      required: true,
    },
    Tel: {
      type: String,
    },
    TrainingType: {
      type: [String],
      required: true,
    },
    Certifications: {
      type: String,
    },
    Experiance:{
      type:Number,
    },
    Courts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courts", 
        required: true,
      }
    ],
    availability: [AvailabilitySlotSchema],
    bookings: [BookingSchema],
    
    hourlyRate: {
      type: Number,
    },
  
  },
  { timestamps: true } 
);



export const AvailabilitySlot = mongoose.model("AvailabilitySlot", AvailabilitySlotSchema);
export const Booking = mongoose.model("Booking", BookingSchema);
export default mongoose.model("Coachers", CoachSchema);
