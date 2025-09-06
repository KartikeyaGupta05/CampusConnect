import userModel from '../models/UserModel.js';

export const createUser = async ({ name, email, password, university, college, role, year, branch, bio }) => {
  if (!name || !email || !password || !university || !college) {
    throw new Error("All fields are required");
  }

  // Check if user already exists
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Create and save user (password hashing happens in schema pre-save hook)
  const user = await userModel.create({
    name,
    email,
    password,
    university,
    college,
    role,
    year,
    branch,
    bio
  });

  return user;
};

