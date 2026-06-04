import express from 'express'
import CryptoJS from 'crypto-js'
import { authenticate } from '../middleware/authenticate.js'
import prisma from '../prismaClient.js'
import { EC2Client, DescribeRegionsCommand } from '@aws-sdk/client-ec2'

const router = express.Router()

// ---- SAVE AWS CREDENTIALS ----
// POST /api/credentials
router.post('/', authenticate, async (req, res) => {
  try {
    const { accessKeyId, secretAccessKey, region } = req.body

    if (!accessKeyId || !secretAccessKey || !region) {
      return res.status(400).json({
        success: false,
        error: 'Access key, secret key and region are required'
      })
    }

    // Encrypt both keys before saving to database
    // If database is ever breached, keys are unreadable
    const encryptedAccessKey = CryptoJS.AES.encrypt(
      accessKeyId,
      process.env.ENCRYPTION_SECRET
    ).toString()

    const encryptedSecretKey = CryptoJS.AES.encrypt(
      secretAccessKey,
      process.env.ENCRYPTION_SECRET
    ).toString()

    // upsert means — update if exists, create if not
    const credentials = await prisma.awsCredentials.upsert({
      where: { userId: req.user.id },
      update: {
        accessKeyId: encryptedAccessKey,
        secretAccessKey: encryptedSecretKey,
        region,
        isVerified: false
      },
      create: {
        userId: req.user.id,
        accessKeyId: encryptedAccessKey,
        secretAccessKey: encryptedSecretKey,
        region,
        isVerified: false
      }
    })

    res.json({
      success: true,
      message: 'AWS credentials saved successfully',
      region: credentials.region
    })

  } catch (err) {
    console.error('Save credentials error:', err)
    res.status(500).json({ success: false, error: 'Failed to save credentials' })
  }
})

// ---- TEST AWS CREDENTIALS ----
// POST /api/credentials/test
// Actually calls AWS to verify the keys work
router.post('/test', authenticate, async (req, res) => {
  try {
    // req.awsCredentials is attached by authenticate middleware
    if (!req.awsCredentials) {
      return res.status(400).json({
        success: false,
        error: 'No AWS credentials found. Please save credentials first.'
      })
    }

    // Try calling AWS EC2 DescribeRegions
    // This is the simplest read-only call — works with any valid key
    const ec2Client = new EC2Client({
      region: req.awsCredentials.region,
      credentials: {
        accessKeyId: req.awsCredentials.accessKeyId,
        secretAccessKey: req.awsCredentials.secretAccessKey
      }
    })

    await ec2Client.send(new DescribeRegionsCommand({}))

    // If we reach here — keys are valid, mark as verified
    await prisma.awsCredentials.update({
      where: { userId: req.user.id },
      data: { isVerified: true }
    })

    res.json({
      success: true,
      message: 'AWS credentials verified successfully',
      verified: true
    })

  } catch (err) {
    // AWS threw an error — keys are invalid
    console.error('Test credentials error:', err)
    res.status(400).json({
      success: false,
      error: 'AWS credentials are invalid. Please check your Access Key and Secret Key.',
      verified: false
    })
  }
})

// ---- GET CREDENTIALS STATUS ----
// GET /api/credentials
router.get('/', authenticate, async (req, res) => {
  try {
    const credentials = await prisma.awsCredentials.findUnique({
      where: { userId: req.user.id }
    })

    if (!credentials) {
      return res.json({
        success: true,
        hasCredentials: false
      })
    }

    res.json({
      success: true,
      hasCredentials: true,
      region: credentials.region,
      isVerified: credentials.isVerified,
      createdAt: credentials.createdAt
    })

  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get credentials' })
  }
})

// ---- DELETE CREDENTIALS ----
// DELETE /api/credentials
router.delete('/', authenticate, async (req, res) => {
  try {
    await prisma.awsCredentials.delete({
      where: { userId: req.user.id }
    })

    res.json({
      success: true,
      message: 'AWS credentials removed successfully'
    })

  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete credentials' })
  }
})

export default router