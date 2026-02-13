import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const connection = mongoose.connection;
const AutoIncrement = AutoIncrementFactory(connection);

const MatchesSchema = new mongoose.Schema(
  {
    MatchPhoto: {
      type: String,
      required: true,
    },
    MatchName: {
      type: String,
      required: true,
    },
    StartDate: {
      type: String,
      required: true,
    },
    EndDate: {
        type: String,
        required: true,
      },
    Weblink: {
      type: String,
      
    },
    
  },
  { timestamps: true, } 
);



export default mongoose.model("Matches", MatchesSchema);
