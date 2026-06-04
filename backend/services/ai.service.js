// ---- RULE-BASED AI OPTIMIZER ----
// Analyzes AWS infrastructure data and generates cost-saving recommendations
// Uses predefined rules based on real AWS best practices — NO paid API needed
// Architecture is modular: swap this file with openai.service.js later if desired

// Instance type pricing (approximate per-hour USD, ap-south-1)
const INSTANCE_PRICING = {
  't2.nano': 0.0058, 't2.micro': 0.0116, 't2.small': 0.023,
  't2.medium': 0.0464, 't2.large': 0.0928, 't2.xlarge': 0.1856,
  't3.nano': 0.0052, 't3.micro': 0.0104, 't3.small': 0.0208,
  't3.medium': 0.0416, 't3.large': 0.0832, 't3.xlarge': 0.1664,
  'm5.large': 0.096, 'm5.xlarge': 0.192, 'm5.2xlarge': 0.384,
  'c5.large': 0.085, 'c5.xlarge': 0.17, 'r5.large': 0.126
}

// Recommend a smaller instance type
function getSmallerInstance(currentType) {
  const downsizeMap = {
    't2.xlarge': 't2.large', 't2.large': 't2.medium',
    't2.medium': 't2.small', 't2.small': 't2.micro',
    't3.xlarge': 't3.large', 't3.large': 't3.medium',
    't3.medium': 't3.small', 't3.small': 't3.micro',
    'm5.2xlarge': 'm5.xlarge', 'm5.xlarge': 'm5.large',
    'c5.xlarge': 'c5.large', 'r5.large': 't3.large'
  }
  return downsizeMap[currentType] || null
}

function getMonthlyCost(instanceType) {
  const hourly = INSTANCE_PRICING[instanceType] || 0.05
  return hourly * 730 // average hours per month
}

export function analyzeInfrastructure(instances, buckets, dailyCosts, svcCosts) {
  const recommendations = []

  // ---- RULE 1: Idle EC2 instances (CPU < 5% for running instances) ----
  for (const instance of instances) {
    if (instance.state === 'running' && parseFloat(instance.cpu) < 5) {
      const smaller = getSmallerInstance(instance.type)
      const currentCost = getMonthlyCost(instance.type)
      const newCost = smaller ? getMonthlyCost(smaller) : currentCost * 0.5
      const saving = Math.max(currentCost - newCost, 1)

      recommendations.push({
        resource: `EC2: ${instance.name} (${instance.id})`,
        recommendation: smaller
          ? `Downsize from ${instance.type} to ${smaller}. CPU averaging ${instance.cpu}% over the last hour — severely underutilized. A smaller instance handles this workload easily.`
          : `Consider stopping or terminating this instance. CPU at ${instance.cpu}% suggests it may not be needed.`,
        saving: parseFloat(saving.toFixed(2)),
        priority: parseFloat(instance.cpu) < 2 ? 'high' : 'medium',
        category: 'rightsizing'
      })
    }
  }

  // ---- RULE 2: Oversized EC2 instances (CPU < 20% but > 5%) ----
  for (const instance of instances) {
    if (instance.state === 'running' && parseFloat(instance.cpu) >= 5 && parseFloat(instance.cpu) < 20) {
      const smaller = getSmallerInstance(instance.type)
      if (smaller) {
        const saving = getMonthlyCost(instance.type) - getMonthlyCost(smaller)
        if (saving > 0.5) {
          recommendations.push({
            resource: `EC2: ${instance.name} (${instance.id})`,
            recommendation: `Consider downsizing from ${instance.type} to ${smaller}. CPU averaging ${instance.cpu}% — has room for a smaller instance type.`,
            saving: parseFloat(saving.toFixed(2)),
            priority: 'low',
            category: 'rightsizing'
          })
        }
      }
    }
  }

  // ---- RULE 3: Stopped EC2 instances still incurring EBS costs ----
  for (const instance of instances) {
    if (instance.state === 'stopped') {
      recommendations.push({
        resource: `EC2: ${instance.name} (${instance.id})`,
        recommendation: `This instance is stopped but still incurs EBS storage costs. If no longer needed, terminate it and delete associated EBS volumes to save money.`,
        saving: 2.50, // approximate EBS cost
        priority: 'medium',
        category: 'cleanup'
      })
    }
  }

  // ---- RULE 4: S3 buckets with zero or very small size (potentially abandoned) ----
  for (const bucket of buckets) {
    const sizeGB = parseFloat(bucket.sizeGB)
    if (sizeGB === 0) {
      recommendations.push({
        resource: `S3: ${bucket.name}`,
        recommendation: `Empty bucket detected. If not in use, delete it to reduce clutter and avoid accidental writes that incur costs.`,
        saving: 0.50,
        priority: 'low',
        category: 'cleanup'
      })
    }
  }

  // ---- RULE 5: Large S3 buckets that could benefit from lifecycle policies ----
  for (const bucket of buckets) {
    const sizeGB = parseFloat(bucket.sizeGB)
    if (sizeGB > 5) {
      const glacierSaving = sizeGB * 0.023 * 0.7 // ~70% savings with Glacier
      recommendations.push({
        resource: `S3: ${bucket.name}`,
        recommendation: `Bucket is ${sizeGB} GB. Enable S3 Intelligent-Tiering or set up lifecycle rules to move infrequently accessed data to S3 Glacier. This can reduce storage costs by up to 70%.`,
        saving: parseFloat(glacierSaving.toFixed(2)),
        priority: sizeGB > 50 ? 'high' : 'medium',
        category: 'storage-optimization'
      })
    }
  }

  // ---- RULE 6: Cost anomaly detection ----
  if (dailyCosts && dailyCosts.length >= 7) {
    const recent = dailyCosts.slice(-7)
    const avg = recent.reduce((sum, d) => sum + parseFloat(d.amount), 0) / recent.length
    const lastDay = parseFloat(recent[recent.length - 1].amount)

    if (lastDay > avg * 1.5) {
      recommendations.push({
        resource: 'Cost Anomaly',
        recommendation: `Yesterday's spend ($${lastDay.toFixed(2)}) was ${((lastDay / avg - 1) * 100).toFixed(0)}% above your 7-day average ($${avg.toFixed(2)}). Investigate recent resource changes or unexpected usage spikes.`,
        saving: parseFloat((lastDay - avg).toFixed(2)),
        priority: 'high',
        category: 'anomaly'
      })
    }
  }

  // ---- RULE 7: Service-level optimization suggestions ----
  if (svcCosts && svcCosts.length > 0) {
    const totalCost = svcCosts.reduce((sum, s) => sum + parseFloat(s.amount), 0)
    for (const svc of svcCosts) {
      const amt = parseFloat(svc.amount)
      const pct = (amt / totalCost) * 100
      if (pct > 60) {
        recommendations.push({
          resource: `Service: ${svc.service}`,
          recommendation: `${svc.service} accounts for ${pct.toFixed(0)}% of your total spend ($${amt.toFixed(2)} of $${totalCost.toFixed(2)}). Consider Reserved Instances or Savings Plans for this service to save up to 40%.`,
          saving: parseFloat((amt * 0.3).toFixed(2)),
          priority: 'medium',
          category: 'savings-plan'
        })
      }
    }
  }

  // ---- RULE 8: General best practices (always include) ----
  if (instances.length > 0) {
    const runningCount = instances.filter(i => i.state === 'running').length
    if (runningCount > 0) {
      recommendations.push({
        resource: 'General: Auto-scaling',
        recommendation: `You have ${runningCount} running instances. Consider setting up Auto Scaling Groups to automatically adjust capacity based on demand, reducing costs during low-traffic periods.`,
        saving: parseFloat((runningCount * 5).toFixed(2)),
        priority: 'low',
        category: 'best-practice'
      })
    }
  }

  // Sort by priority: high first, then medium, then low
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2))

  return recommendations
}