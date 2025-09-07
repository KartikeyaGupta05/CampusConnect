import userModel from "../models/UserModel.js";

export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      college: user.college,
      role: user.role,
      year: user.year,
      branch: user.branch,
      bio: user.bio,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
