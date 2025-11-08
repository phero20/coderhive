const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../model/User')

const JWT_SECRET = process.env.JWT_SECRET || 'coderhive_default_secret'

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'User already exists' })

    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(password, salt)

    const user = new User({ name, email, password: hashed })
    await user.save()

    // sign token without expiry (unlimited)
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET)

    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    console.error('register error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'email and password required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

    // sign token without expiry
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET)

    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    console.error('login error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}
