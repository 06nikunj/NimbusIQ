import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import prisma from '../prismaClient.js'

const router = express.Router()

router.get('/', authenticate, async (req, res) => {
  try {
    const alert = await prisma.alert.findFirst({
      where: { userId: req.user.id }
    })
    res.json({ success: true, data: alert })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/', authenticate, async (req, res) => {
  try {
    const { dailyLimit, monthlyLimit, email } = req.body
    // upsert = update if exists, create if not
    // prevents duplicate alert records when user clicks "Update Alert"
    const existing = await prisma.alert.findFirst({
      where: { userId: req.user.id }
    })
    let alert
    if (existing) {
      alert = await prisma.alert.update({
        where: { id: existing.id },
        data: { dailyLimit, monthlyLimit, email }
      })
    } else {
      alert = await prisma.alert.create({
        data: { userId: req.user.id, dailyLimit, monthlyLimit, email }
      })
    }
    res.json({ success: true, data: alert })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/history', authenticate, async (req, res) => {
  try {
    const history = await prisma.alertHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { triggeredAt: 'desc' },
      take: 20
    })
    res.json({ success: true, data: history })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router