import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { getEC2Instances } from '../services/ec2.service.js'

const router = express.Router()

router.get('/instances', authenticate, async (req, res) => {
  try {
    if (!req.awsCredentials) {
      return res.status(400).json({
        success: false,
        error: 'No AWS credentials configured. Please add your AWS credentials first.'
      })
    }
    const instances = await getEC2Instances(req.awsCredentials)
    res.json({ success: true, data: instances })
  } catch (err) {
    console.error('EC2 Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router