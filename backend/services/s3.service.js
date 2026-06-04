import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch'

async function getBucketSize(bucketName, credentials) {
  const now = new Date()
  const past = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const cloudWatchClient = new CloudWatchClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  })

  const command = new GetMetricStatisticsCommand({
    Namespace: 'AWS/S3',
    MetricName: 'BucketSizeBytes',
    Dimensions: [
      { Name: 'BucketName', Value: bucketName },
      { Name: 'StorageType', Value: 'StandardStorage' }
    ],
    StartTime: past,
    EndTime: now,
    Period: 86400,
    Statistics: ['Average']
  })

  try {
    const response = await cloudWatchClient.send(command)
    if (response.Datapoints.length > 0) {
      return (response.Datapoints[0].Average / (1024 * 1024 * 1024)).toFixed(2)
    }
    return 0
  } catch (err) {
    return 0
  }
}

export async function getS3Buckets(credentials) {
  const s3Client = new S3Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  })

  const command = new ListBucketsCommand({})
  const response = await s3Client.send(command)
  const buckets = []

  for (const bucket of response.Buckets) {
    const sizeGB = await getBucketSize(bucket.Name, credentials)
    buckets.push({
      name: bucket.Name,
      createdAt: bucket.CreationDate,
      sizeGB,
      estimatedMonthlyCost: (sizeGB * 0.023).toFixed(2)
    })
  }

  return buckets
}