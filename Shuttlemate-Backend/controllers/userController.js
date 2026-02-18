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

      // --- SECURITY FIX: IDOR Protection (vulnerability 03 - part 1) ---
      // Authorization: only allow own profile or admin
      if (req.user.id !== user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this profile' });
      }

      // --- END SECURITY FIX ---


      // --- SECURITY FIX: IDOR Protection (vulnerability 03 - part 2) ---
      // Remove sensitive fields from response
      const userResponse = user.toObject();
      delete userResponse.password;
      res.status(200).json(userResponse);

      // --- END SECURITY FIX ---

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

    // --- SECURITY FIX: IDOR Protection (vulnerability 03 - part 3) ---
    // Authorization: only allow own profile or admin
    const targetUser = await User.findOne({ firebaseUid });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.user.id !== targetUser._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // --- END SECURITY FIX ---


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

        // --- SECURITY FIX: IDOR Protection (vulnerability 03 - part 4) ---
        // first find the user , check, then delete

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Authorization: only allow own account or admin
        if (req.user.id !== user._id.toString() && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Not authorized to delete this account' });
        }


        await User.findByIdAndDelete(req.params.id);

        // --- END SECURITY FIX ---
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

