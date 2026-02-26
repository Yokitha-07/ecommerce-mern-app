// const express = require("express");
// const router = express.Router();

// // ... routes here ...

// module.exports = router;  // ✅ must be exactly this

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ✅ REGISTER (hash password then save into passwordHash)
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "customer",
    });

    res.status(201).json({
      msg: "Registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ LOGIN (verify using passwordHash)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1) Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // 2) Compare password to stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    // 3) Create token
    const token = jwt.sign(
      { id: user._id, role: user.role, permissions: user.permissions },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4) Return token + user
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

const { verifyToken } = require("../middleware/auth");

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
});


module.exports = router;