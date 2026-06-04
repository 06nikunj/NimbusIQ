import cron from 'node-cron'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import prisma from './prismaClient.js'
import { getDailyCosts, getMonthlyTotal } from './services/costexplorer.service.js'
import CryptoJS from 'crypto-js'

// This cron job runs every hour automatically
// It checks every user's AWS spend against their budget limits
// If exceeded — sends email via AWS SNS

export function startCronJobs() {
  console.log('⏰ Cron jobs started — checking budgets every hour')

  // Runs every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running budget check cron job...')
    await checkAllUserBudgets()
  })
}

async function checkAllUserBudgets() {
  try {
    // Get all users who have both AWS credentials and alert settings
    const alerts = await prisma.alert.findMany({
      where: { isActive: true },
      include: {
        user: {
          include: { awsCredentials: true }
        }
      }
    })

    for (const alert of alerts) {
      if (!alert.user.awsCredentials) continue

      // Decrypt AWS credentials for this user
      const accessKeyId = CryptoJS.AES.decrypt(
        alert.user.awsCredentials.accessKeyId,
        process.env.ENCRYPTION_SECRET
      ).toString(CryptoJS.enc.Utf8)

      const secretAccessKey = CryptoJS.AES.decrypt(
        alert.user.awsCredentials.secretAccessKey,
        process.env.ENCRYPTION_SECRET
      ).toString(CryptoJS.enc.Utf8)

      const credentials = {
        accessKeyId,
        secretAccessKey,
        region: alert.user.awsCredentials.region
      }

      try {
        // Get current costs for this user
        const dailyCosts = await getDailyCosts(credentials)
        const todaySpend = parseFloat(
          dailyCosts[dailyCosts.length - 1]?.amount || '0'
        )
        const monthlyTotal = parseFloat(
          await getMonthlyTotal(credentials)
        )

        // Check daily limit
        if (todaySpend > alert.dailyLimit) {
          await triggerAlert(alert, 'daily', todaySpend, alert.dailyLimit, credentials)
        }

        // Check monthly limit
        if (monthlyTotal > alert.monthlyLimit) {
          await triggerAlert(alert, 'monthly', monthlyTotal, alert.monthlyLimit, credentials)
        }

      } catch (err) {
        console.error(`Budget check failed for user ${alert.user.email}:`, err)
      }
    }

  } catch (err) {
    console.error('Cron job error:', err)
  }
}

async function triggerAlert(alert, type, amount, limit, credentials) {
  try {
    // Save to alert history
    await prisma.alertHistory.create({
      data: {
        userId: alert.userId,
        type,
        amount,
        limit
      }
    })

    // Send email via AWS SNS
    const snsClient = new SNSClient({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    })

    const message = `
NimbusIQ Budget Alert

Your AWS ${type} spend has exceeded your configured limit.

Amount spent: $${amount.toFixed(2)}
Your limit: $${limit.toFixed(2)}
Exceeded by: $${(amount - limit).toFixed(2)}

Log in to NimbusIQ to view your cost breakdown and take action.
    `.trim()

    const command = new PublishCommand({
      Message: message,
      Subject: `NimbusIQ Alert: ${type} budget exceeded ($${amount.toFixed(2)})`,
      TopicArn: process.env.SNS_TOPIC_ARN || undefined,
      // If no topic ARN, send directly to email
      ...(process.env.SNS_TOPIC_ARN ? {} : {
        MessageStructure: 'string',
        PhoneNumber: undefined,
      })
    })

    // Only send SNS if topic ARN is configured
    if (process.env.SNS_TOPIC_ARN) {
      await snsClient.send(command)
      console.log(`Alert email sent to ${alert.email} for ${type} budget`)
    } else {
      console.log(`Alert triggered for ${alert.user.email}: ${type} $${amount} > $${limit}`)
    }

  } catch (err) {
    console.error('Alert trigger error:', err)
  }
}