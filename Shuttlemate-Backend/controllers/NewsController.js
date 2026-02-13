import News from "../models/news.js";

// Create a new news entry
export const createNews = async (req, res) => {
  try {
    const { title, body, source, time } = req.body;

    const news = new News({
      title,
      body,
      source,
      time,
    });

    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all news
export const getAllNews = async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 });
    res.json(newsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single news by ID
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update news
export const updateNews = async (req, res) => {
  try {
    const { title, body, source, time } = req.body;
    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      { title, body, source, time },
      { new: true, runValidators: true }
    );
    if (!updatedNews) return res.status(404).json({ message: "News not found" });
    res.json(updatedNews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete news
export const deleteNews = async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews) return res.status(404).json({ message: "News not found" });
    res.json({ message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
