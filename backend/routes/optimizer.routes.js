import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { getEC2Instances } from '../services/ec2.service.js'
import { getS3Buckets } from '../services/s3.service.js'
import { getDailyCosts, getCostByService } from '../services/costexplorer.service.js'
import { analyzeInfrastructure } from '../services/ai.service.js'
import prisma from '../prismaClient.js'

const router = express.Router()

// POST /api/optimizer/analyze
// Collects all AWS data and runs rule-based AI analysis
router.post('/analyze', authenticate, async (req, res) => {
  try {
    if (!req.awsCredentials) {
      return res.status(400).json({
        success: false,
        error: 'No AWS credentials configured. Please add your AWS credentials first.'
      })
    }

    // Step 1 — Collect all AWS data in parallel
    const [instances, buckets, dailyCosts, svcCosts] = await Promise.all([
      getEC2Instances(req.awsCredentials),
      getS3Buckets(req.awsCredentials),
      getDailyCosts(req.awsCredentials).catch(() => []),
      getCostByService(req.awsCredentials).catch(() => [])
    ])

    // Step 2 — Run rule-based analysis
    const recommendations = analyzeInfrastructure(
      instances, buckets, dailyCosts, svcCosts
    )

    // Step 3 — Clear old recommendations and save new ones
    await prisma.aiRecommendation.deleteMany({
      where: { userId: req.user.id }
    })

    if (recommendations.length > 0) {
      await prisma.aiRecommendation.createMany({
        data: recommendations.map(r => ({
          userId: req.user.id,
          resource: r.resource,
          recommendation: r.recommendation,
          saving: r.saving,
          status: 'pending'
        }))
      })
    }

    // Step 4 — Return to frontend
    const totalSaving = recommendations.reduce(
      (sum, r) => sum + r.saving, 0
    )

    res.json({
      success: true,
      data: recommendations,
      totalSaving: totalSaving.toFixed(2)
    })

  } catch (err) {
    console.error('AI Optimizer error:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'AI analysis failed'
    })
  }
})

// GET /api/optimizer/recommendations
// Get previously saved recommendations
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const recs = await prisma.aiRecommendation.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: recs })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' })
  }
})

// PATCH /api/optimizer/:id/status
// Update recommendation status (applied / dismissed)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body
    if (!['applied', 'dismissed', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be: applied, dismissed, or pending'
      })
    }

    await prisma.aiRecommendation.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    })

    res.json({ success: true, message: 'Recommendation status updated' })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update status' })
  }
})

export default router