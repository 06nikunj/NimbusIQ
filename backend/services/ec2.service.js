import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2'
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch'

// credentials parameter comes from the logged-in user's database record
// decrypted by authenticate middleware and passed via req.awsCredentials

async function getCPUUsage(instanceId, credentials) {
  const now = new Date()
  const past = new Date(now.getTime() - 60 * 60 * 1000)

  const cloudWatchClient = new CloudWatchClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  })

  const command = new GetMetricStatisticsCommand({
    Namespace: 'AWS/EC2',
    MetricName: 'CPUUtilization',
    Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
    StartTime: past,
    EndTime: now,
    Period: 3600,
    Statistics: ['Average']
  })

  try {
    const response = await cloudWatchClient.send(command)
    if (response.Datapoints.length > 0) {
      return response.Datapoints[0].Average.toFixed(2)
    }
    return 0
  } catch (err) {
    return 0
  }
}

export async function getEC2Instances(credentials) {
  const ec2Client = new EC2Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  })

  const command = new DescribeInstancesCommand({})
  const response = await ec2Client.send(command)
  const instances = []

  for (const reservation of response.Reservations) {
    for (const instance of reservation.Instances) {
      const name = instance.Tags?.find(t => t.Key === 'Name')?.Value || 'Unnamed'
      const cpu = await getCPUUsage(instance.InstanceId, credentials)

      instances.push({
        id: instance.InstanceId,
        name,
        type: instance.InstanceType,
        state: instance.State.Name,
        region: credentials.region,
        cpu,
        launchTime: instance.LaunchTime
      })
    }
  }

  return instances
}