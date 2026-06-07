// ---- IMPORTS ----
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// ---- ROUTE IMPORTS ----
import ec2Router from './routes/ec2.routes.js'
import s3Router from './routes/s3.routes.js'
import costsRouter from './routes/costs.routes.js'
import alertsRouter from './routes/alerts.routes.js'
import authRouter from './routes/auth.routes.js'
import credentialsRouter from './routes/credentials.routes.js'
import optimizerRouter from './routes/optimizer.routes.js'
import { startCronJobs } from './cronJob.js'
// ---- LOAD ENVIRONMENT VARIABLES ----
dotenv.config()

// ---- CREATE EXPRESS APP ----
const app = express()
const PORT = process.env.PORT || 5000

// ---- MIDDLEWARE ----
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://nimbusiq.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())

// ---- HEALTH CHECK ----
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'NimbusIQ backend is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  })
})

// ---- API ROUTES ----
// Public routes — no login required
app.use('/api/auth', authRouter)

// Protected routes — login required
app.use('/api/ec2', ec2Router)
app.use('/api/s3', s3Router)
app.use('/api/costs', costsRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/credentials', credentialsRouter)
app.use('/api/optimizer', optimizerRouter)
// ---- 404 HANDLER ----
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ---- GLOBAL ERROR HANDLER ----
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

// ---- START SERVER ----
app.listen(PORT, () => {
  console.log(`✅ NimbusIQ backend running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔐 Auth: JWT enabled`)
  console.log(`🔒 Encryption: AES enabled`)
  startCronJobs()
})