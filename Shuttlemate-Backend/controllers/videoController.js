import Video from "../models/Video.js";
import AutoIncrementFactory from "mongoose-sequence";


export const createVideo = async (req, res, next) => {
  const { imgUrl, videoUrl,videoName,videoCreator,videoCreatorPhoto } = req.body;
 
  
//create video
  try {
    const video = await Video.create({
      imgUrl,
      videoUrl,
      videoName,
      videoCreator,
      videoCreatorPhoto
    });

    res.status(201).json({
      success: true,
      video,
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    next(error);
  }
}

//get videos
export const getVideos = async (req, res, next) => {
  try {
    // Remove the field projection to get all data
    const videos = await Video.find();

    const formattedVideos = videos.map(video => ({
      ...video._doc,
      createdAt: video.createdAt.toISOString().split('T')[0], // Format to YYYY-MM-DD
    }));

    res.status(200).json({
      success: true,
      videos: formattedVideos,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ success: false, message: "Failed to fetch videos" });
    next(error);
  }
};


//delete video
export const deleteVideo = async(req,res,next) =>{
  try
  {
    const{id} = req.params;
    const video = await Video.findByIdAndDelete(id);

    if(!video){
      return res.status(404).json({success:false, message:'Video not found'});
    }
    res.status(200).json({success:true , message:"Video deleted successfulty"});
  }catch(error){
    console.log("Error deleting video", error);
    res.status(500).json({success:false, message:"Failed to delete video"});
    next(error);
  }
};



//Update Coach
export const updateVideo = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updateVideo = await Video.findByIdAndUpdate(id, updateData, { new: true });
    if (!updateVideo) {
      return res.status(404).json({ success: false, message: "video not found" });
    }
    res.status(200).json({ success: true, video: updateVideo });
  } catch (error) {
    console.error("Error updating coach :", error);
    res.status(500).json({ success: false, message: "Failed to update vidoe" });
    next(error);
  }
}


export const searchVideos = async (req, res) => {
  const { search } = req.query;

  try {
    const videos = await Video.find({
      videoName: { $regex: search, $options: 'i' }, // case-insensitive
    });

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};