import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const connection = mongoose.connection; 
const AutoIncrement = AutoIncrementFactory(connection); 

const newsSchema = new mongoose.Schema(
  {
    
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required :true,
    },
    time :{
      type: String,
      required:true,
    }
   
  },
  {
    timestamps: true,
  }
);



export default mongoose.model("News", newsSchema);