import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

const router = express.Router()

// ---- REGISTER ----
// POST /api/auth/register
// Creates a new user account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email and password are required' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    })
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered. Please login.' 
      })
    }

    // Hash password — never store plain text
    // 12 is the salt rounds — higher = more secure but slower
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in database
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    // Create JWT token — expires in 7 days
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ success: false, error: 'Registration failed' })
  }
})

// ---- LOGIN ----
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { awsCredentials: true }
    })

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      })
    }

    // Compare password with hashed version
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      })
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        hasAwsCredentials: !!user.awsCredentials,
        awsRegion: user.awsCredentials?.region || null
      }
    })

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

// ---- GET CURRENT USER ----
// GET /api/auth/me
import { authenticate } from '../middleware/authenticate.js'

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { awsCredentials: true }
    })

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        hasAwsCredentials: !!user.awsCredentials,
        awsRegion: user.awsCredentials?.region || null,
        awsVerified: user.awsCredentials?.isVerified || false
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get user' })
  }
})

export default router