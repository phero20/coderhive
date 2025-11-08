import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "coderhive_default_secret";

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }

    // Optional role validation
    const allowedRoles = ["reseller", "manufacturer"];
    const selectedRole = role && allowedRoles.includes(role) ? role : undefined;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashed,
      ...(selectedRole && { role: selectedRole }),
    });
    await user.save();

    // sign token without expiry (unlimited) - include role in token payload
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // ensure role fallback for older users
    const roleFallback = user.role || "reseller";

    // sign token without expiry (include role)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: roleFallback },
      JWT_SECRET
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleFallback,
      },
    });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ message: "Server error" });
  }
}
