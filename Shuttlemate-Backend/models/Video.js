import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const connection = mongoose.connection; 
const AutoIncrement = AutoIncrementFactory(connection); 

const videoSchema = new mongoose.Schema(
  {
    _vid: {
      type: Number, 
    },
    imgUrl: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    videoName: {
      type: String,
      required :true,
    },
    videoCreator :{
      type: String,
      required:true,
    }
   ,videoCreatorPhoto :{
    type: String,
    required:true,
  }
  },
  {
    timestamps: true,
  }
);


videoSchema.plugin(AutoIncrement, { inc_field: "_vid" });
export default mongoose.model("Video", videoSchema);