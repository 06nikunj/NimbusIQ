import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer'

export async function getDailyCosts(credentials) {
  // Cost Explorer only works in us-east-1 regardless of your region
  const costClient = new CostExplorerClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  })

  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)

  const command = new GetCostAndUsageCommand({
    TimePeriod: {
      Start: start.toISOString().split('T')[0],
      End: end.toISOString().split('T')[0]
    },
    Granularity: 'DAILY',
    Metrics: ['UnblendedCost']
  })

  const response = await costClient.send(command)
  return response.ResultsByTime.map(item => ({
    date: item.TimePeriod.Start,
    amount: parseFloat(item.Total.UnblendedCost.Amount).toFixed(2)
  }))
}

export async function getCostByService(credentials) {
  const costClient = new CostExplorerClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  })

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split('T')[0]
  const end = now.toISOString().split('T')[0]

  const command = new GetCostAndUsageCommand({
    TimePeriod: { Start: start, End: end },
    Granularity: 'MONTHLY',
    Metrics: ['UnblendedCost'],
    GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }]
  })

  const response = await costClient.send(command)
  return response.ResultsByTime[0].Groups.map(group => ({
    service: group.Keys[0],
    amount: parseFloat(group.Metrics.UnblendedCost.Amount).toFixed(2)
  }))
}

export async function getMonthlyTotal(credentials) {
  const costs = await getCostByService(credentials)
  const total = costs.reduce((sum, item) => sum + parseFloat(item.amount), 0)
  return total.toFixed(2)
}