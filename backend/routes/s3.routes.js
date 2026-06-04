import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { getS3Buckets } from '../services/s3.service.js'

const router = express.Router()

router.get('/buckets', authenticate, async (req, res) => {
  try {
    if (!req.awsCredentials) {
      return res.status(400).json({
        success: false,
        error: 'No AWS credentials configured. Please add your AWS credentials first.'
      })
    }
    const buckets = await getS3Buckets(req.awsCredentials)
    res.json({ success: true, data: buckets })
  } catch (err) {
    console.error('S3 Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router