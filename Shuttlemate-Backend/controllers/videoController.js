import Video from "../models/Video.js";
import AutoIncrementFactory from "mongoose-sequence";


export const createVideo = async (req, res, next) => {
  const { imgUrl, videoUrl,videoName,videoCreator,videoCreatorPhoto } = req.body;
 
  
//create video
  try {
    // Whitelist and validate required fields
    const allowedFields = ['name', 'address', 'phone', 'email', 'category', 'city', 'state'];
    const shopData = {};
  
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        shopData[field] = String(req.body[field]).trim();
      }
    });
  
    // Validate required fields
    if (!shopData.name || !shopData.address || !shopData.phone || !shopData.email) {
      return res.status(400).json({ 
        error: "Missing required fields: name, address, phone, email" 
      });
    }
    
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
    // Sanitize and validate search input
    const search = String(req.query.search || '').trim();
  
    if (search.length > 100) {
      return res.status(400).json({ 
        error: "Search query too long" 
      });
    }
  
    // Escape regex special characters
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
    const results = await Video.find({
      videoName: { $regex: escapedSearch, $options: 'i' }
    });
  
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};