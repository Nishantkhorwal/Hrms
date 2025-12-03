import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import HrmsModel from '../models/userModel.js';
import dotenv from 'dotenv';
import HrmsSiteSettings from '../models/siteSettingsModel.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;



// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role} = req.body;

//     // check existing user
//     const existingUser = await HrmsModel.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

    

//     // hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // create user
//     const user = await HrmsModel.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: role || 'User', // default = User
//     });

//     res.status(201).json({
//       message: 'User registered successfully',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, site } = req.body;

    // ✅ SuperAdmin & Admin DO NOT require site
    // ✅ Users MUST have site
    if (role === "User" && !site) {
      return res.status(400).json({ message: "Site is required for User accounts" });
    }

    // ✅ Check existing user
    const existingUser = await HrmsModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await HrmsModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || "User",
      site: role === "User" ? site : null,  // ✅ Only User gets a site
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        site: user.site,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



export const loginUser = async (req, res) => {
  try {
    const { email, password, site } = req.body;

    // ✅ Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await HrmsModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ USER: Must send site + site must match
    if (user.role === "User") {
      if (!site) {
        return res.status(400).json({ message: "Site is required for User login" });
      }
      if (user.site !== site) {
        return res.status(403).json({
          message: `Access denied. You can only log in from your assigned site (${user.site}).`,
        });
      }
    }

    // ✅ ADMIN & SUPERADMIN:
    // No site required, no site check.

    // ✅ Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Generate token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        site: user.site || null, // ✅ null for Admin & SuperAdmin
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        site: user.site || null,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




export const editUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password, role, site } = req.body;
    if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Only SuperAdmin can edit users." });
  }


    const updatedFields = {};

    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (role) updatedFields.role = role;
    if (site) updatedFields.site = site;

    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await HrmsModel.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// ✅ GET USERS (Admin = all users, Normal user = only same site)
export const getUser = async (req, res) => {
  try {
    const requesterId = req.user.id;

    const requester = await HrmsModel.findById(requesterId).select('-password');
    if (!requester) {
      return res.status(404).json({ message: 'Requester not found' });
    }

    let users;

    if (requester.role === 'Admin' && requester.role === 'SuperAdmin') {
      // Admin can view all
      users = await HrmsModel.find().select('-password');
    } else {
      // Normal user only sees users from his site
      users = await HrmsModel.find({ site: requester.site }).select('-password');
    }

    res.json({
      message: 'Users fetched successfully',
      users,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateDailyLimit = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Only SuperAdmin can set limits" });
    }

    const { siteName, dailyLimit } = req.body;

    if (!siteName) {
      return res.status(400).json({ message: "siteName is required" });
    }

    if (dailyLimit < 0) {
      return res.status(400).json({ message: "dailyLimit cannot be negative" });
    }

    const settings = await HrmsSiteSettings.findOneAndUpdate(
      { siteName },
      { dailyLimit },
      { upsert: true, new: true, runValidators: true } // important since enum exists
    );

    res.json({
      message: "Daily limit updated successfully",
      data: settings
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getDailyLimits = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Only SuperAdmin can view limits" });
    }

    const { siteName } = req.query;

    // Pagination query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // If a specific site is requested (no pagination needed)
    if (siteName) {
      const settings = await HrmsSiteSettings.findOne({ siteName });

      if (!settings) {
        return res.status(404).json({ message: "No limit found for this site" });
      }

      return res.json({
        message: "Site limit fetched",
        data: settings,
        pagination: {
          enabled: false
        }
      });
    }

    // Fetch all sites WITH pagination
    const totalCount = await HrmsSiteSettings.countDocuments({});
    const totalPages = Math.ceil(totalCount / limit);

    const allSettings = await HrmsSiteSettings
      .find({})
      .sort({ siteName: 1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      message: "All site limits fetched",
      data: allSettings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};





// export const editUser = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { name, email, password, role} = req.body;

//     const updatedFields = {};
//     if (name) updatedFields.name = name;
//     if (email) updatedFields.email = email;
//     if (role) updatedFields.role = role;

//     if (password) {
//       updatedFields.password = await bcrypt.hash(password, 10);
//     }

//     const updatedUser = await HrmsModel.findByIdAndUpdate(
//       userId,
//       updatedFields,
//       { new: true }
//     ).select('-password');

//     res.json({
//       message: 'User updated successfully',
//       user: updatedUser,
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


// export const getUser = async (req, res) => {
//   try {
//     const requesterId = req.user.id;

//     // find the logged-in user (to check role & project)
//     const requester = await HrmsModel.findById(requesterId).select('-password');
//     if (!requester) {
//       return res.status(404).json({ message: 'Requester not found' });
//     }

//     let users;

//     if (requester.role === 'Admin') {
//       // Admin can see everyone
//       users = await HrmsModel.find().select('-password');
//     } else {
//       // User can see only users from their own project
//       users = await HrmsModel.find().select('-password');
//     }

//     res.json({
//       message: 'Users fetched successfully',
//       users,
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };
