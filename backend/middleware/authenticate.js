import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'
import CryptoJS from 'crypto-js'

// This middleware runs before every protected route
// It checks the JWT token, finds the user, fetches their AWS keys
// and attaches everything to req object for the route to use

export const authenticate = async (req, res, next) => {
  try {
    // Step 1 — Get token from request header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided. Please login.' 
      })
    }

    // Step 2 — Extract and verify the token
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Step 3 — Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { awsCredentials: true }
    })

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found. Please login again.' 
      })
    }

    // Step 4 — Attach user to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email
    }

    // Step 5 — If user has AWS credentials, decrypt and attach them
    if (user.awsCredentials) {
      const decryptedAccessKey = CryptoJS.AES.decrypt(
        user.awsCredentials.accessKeyId,
        process.env.ENCRYPTION_SECRET
      ).toString(CryptoJS.enc.Utf8)

      const decryptedSecretKey = CryptoJS.AES.decrypt(
        user.awsCredentials.secretAccessKey,
        process.env.ENCRYPTION_SECRET
      ).toString(CryptoJS.enc.Utf8)

      req.awsCredentials = {
        accessKeyId: decryptedAccessKey,
        secretAccessKey: decryptedSecretKey,
        region: user.awsCredentials.region,
        isVerified: user.awsCredentials.isVerified
      }
    } else {
      req.awsCredentials = null
    }

    // Step 6 — Continue to the actual route
    next()

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token. Please login again.' 
      })
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired. Please login again.' 
      })
    }
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed.' 
    })
  }
}