import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { getDailyCosts, getCostByService, getMonthlyTotal } from '../services/costexplorer.service.js'

const router = express.Router()

router.get('/daily', authenticate, async (req, res) => {
  try {
    if (!req.awsCredentials) {
      return res.status(400).json({ success: false, error: 'No AWS credentials configured.' })
    }
    const data = await getDailyCosts(req.awsCredentials)
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/by-service', authenticate, async (req, res) => {
  try {
    if (!req.awsCredentials) {
      return res.status(400).json({ success: false, error: 'No AWS credentials configured.' })
    }
    const data = await getCostByService(req.awsCredentials)
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/monthly-total', authenticate, async (req, res) => {
  try {
    if (!req.awsCredentials) {
      return res.status(400).json({ success: false, error: 'No AWS credentials configured.' })
    }
    const total = await getMonthlyTotal(req.awsCredentials)
    res.json({ success: true, total })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router