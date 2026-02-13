import User from '../models/user.js';

// Create a new user
export const createUser = async (req, res) => {
    try {
      const { email } = req.body;
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const user = new User(req.body);
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getUserById = async (req, res) => {
  try {
      const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json(user);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};




export const updateUser = async (req, res) => {
  try {
    // Get firebaseUid from URL parameter
    const firebaseUid = req.params.firebaseUid;

    if (!firebaseUid) {
      return res.status(400).json({ message: "Firebase UID is required" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: firebaseUid },
      {
        $set: req.body,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response for security
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  
// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

