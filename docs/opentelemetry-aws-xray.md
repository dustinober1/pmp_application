# AWS X-Ray Integration Guide

Production-ready OpenTelemetry setup for AWS deployment.

## Prerequisites

- AWS Account with appropriate permissions
- EKS or ECS cluster for deployment
- AWS CLI configured
- kubectl (if using EKS)

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js     │────▶│  API Server │
│             │     │  (Web)       │     │  (Node.js)  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                                                 ▼
                                          ┌──────────┐
                                          │ AWS X-Ray│
                                          │ Daemon   │
                                          └──────────┘
```

## AWS Setup

### 1. Create IAM Policy

Create `x-ray-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords",
        "xray:GetSamplingRules",
        "xray:GetSamplingTargets",
        "xray:GetSamplingStatisticSummaries"
      ],
      "Resource": [
        "arn:aws:xray:us-east-1:123456789012:*"
      ]
    }
  ]
}
```

**Create policy:**
```bash
aws iam create-policy \
  --policy-name PMPXRayAccess \
  --policy-document file://x-ray-policy.json
```

### 2. Create IAM Role for EKS

**For EKS (IRSA):**
```bash
# Create OIDC provider (if not exists)
eksctl utils associate-iam-oidc-provider \
  --cluster=pmp-cluster \
  --region=us-east-1 \
  --approve

# Create IAM role
eksctl create iamserviceaccount \
  --cluster=pmp-cluster \
  --namespace=pmp \
  --name=pmp-api \
  --attach-policy-arn=arn:aws:iam::123456789012:policy/PMPXRayAccess \
  --approve \
  --region=us-east-1
```

**For ECS:**
```bash
# Create task role
aws iam create-role \
  --role-name pmp-api-task-role \
  --assume-role-policy-document file://ecs-trust-policy.json

# Attach policy
aws iam attach-role-policy \
  --role-name pmp-api-task-role \
  --policy-arn=arn:aws:iam::123456789012:policy/PMPXRayAccess
```

### 3. Deploy X-Ray Daemon

**EKS Deployment:**

Create `x-ray-daemon.yaml`:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: xray-daemon
  namespace: pmp
spec:
  selector:
    matchLabels:
      app: xray-daemon
  template:
    metadata:
      labels:
        app: xray-daemon
    spec:
      containers:
      - name: xray-daemon
        image: amazon/aws-xray-daemon:latest
        ports:
        - containerPort: 2000/udp
          protocol: UDP
        resources:
          limits:
            cpu: 100m
            memory: 256Mi
        volumeMounts:
        - name: config
          mountPath: /aws/xray
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: xray-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: xray-config
  namespace: pmp
data:
  config.yaml: |
    XRayDaemon:
      TotalBufferSizeMB: 64
      SegmentProcessor:
        BatchSizeMB: 10
      Logging:
        LogLevel: "INFO"
```

**Deploy:**
```bash
kubectl apply -f x-ray-daemon.yaml
```

**ECS Task Definition:**

Add X-Ray sidecar:
```json
{
  "family": "pmp-api",
  "containerDefinitions": [
    {
      "name": "pmp-api",
      "image": "...",
      "environment": [
        {
          "name": "AWS_XRAY_DAEMON_ADDRESS",
          "value": "xray-daemon:2000"
        }
      ],
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ]
    },
    {
      "name": "xray-daemon",
      "image": "amazon/aws-xray-daemon:latest",
      "cpu": 100,
      "memory": 256,
      "portMappings": [
        {
          "containerPort": 2000,
          "protocol": "udp"
        }
      ],
      "essential": true
    }
  ]
}
```

## Application Configuration

### Update OpenTelemetry Config

**File:** `packages/api/src/config/opentelemetry.ts`

```typescript
import {
  NodeSDK,
  NodeSDKConfiguration,
} from '@opentelemetry/sdk-node';
import {
  AWSXRayExporter,
} from '@opentelemetry/exporter-aws-xray';
import {
  AwsInstrumentation,
} from '@opentelemetry/instrumentation-aws-sdk';
import {
  Resource,
} from '@opentelemetry/resources';
import {
  SemanticResourceAttributes,
} from '@opentelemetry/semantic-conventions';

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Configure resource
const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'pmp-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    // AWS-specific attributes
    ...(isProduction && {
      'cloud.provider': 'aws',
      'cloud.platform': 'aws_eks', // or 'aws_ecs'
      'aws.region': process.env.AWS_REGION || 'us-east-1',
    }),
  })
);

// Configure exporter
let traceExporter;

if (isProduction) {
  // Production: AWS X-Ray
  traceExporter = new AWSXRayExporter({
    region: process.env.AWS_REGION || 'us-east-1',
  });
} else {
  // Development: OTLP Collector
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
  traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
  });
}

// Configure instrumentations
const instrumentations = [
  new AwsInstrumentation({
    suppressInternalInstrumentation: true,
  }),
  // ... other instrumentations
];

// Configure SDK
const sdkConfig: NodeSDKConfiguration = {
  resource,
  traceExporter,
  instrumentations,
  serviceName: 'pmp-api',

  // Sampling strategy
  sampler: {
    shouldSample: (context, traceId, spanName, spanKind, attributes, links) => {
      // Critical paths - 100%
      const route = attributes?.[SemanticResourceAttributes.HTTP_ROUTE] as string || '';
      if (route.includes('/api/stripe') ||
          route.includes('/api/subscriptions') ||
          route.includes('/api/auth')) {
        return true;
      }

      // Health checks - 1%
      if (route.includes('/api/health')) {
        return Math.random() < 0.01;
      }

      // Production: 10% sampling
      // Development: 100% sampling
      if (isProduction) {
        return Math.random() < 0.1;
      }

      return true;
    },
  },
};

const sdk = new NodeSDK(sdkConfig);

export { sdk };
export async function startOpenTelemetry() {
  await sdk.start();
  console.log('[OpenTelemetry] Started with AWS X-Ray exporter');
}
```

### Update Dependencies

```bash
cd packages/api
npm install @opentelemetry/exporter-aws-xray @opentelemetry/instrumentation-aws-sdk
```

## Environment Variables

### Production (EKS/ECS)

**Add to deployment:**
```bash
OTEL_SERVICE_NAME=pmp-api
OTEL_EXPORTER_OTLP_ENDPOINT= # Not needed for X-Ray
AWS_REGION=us-east-1
AWS_XRAY_DAEMON_ADDRESS=xray-daemon:2000
AWS_XRAY_CONTEXT_MISSING=RUNTIME_ERROR
NODE_ENV=production
```

### Kubernetes ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pmp-api-config
  namespace: pmp
data:
  NODE_ENV: "production"
  OTEL_SERVICE_NAME: "pmp-api"
  AWS_REGION: "us-east-1"
  AWS_XRAY_DAEMON_ADDRESS: "xray-daemon:2000"
```

### ECS Task Definition

```json
{
  "containerDefinitions": [
    {
      "name": "pmp-api",
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "OTEL_SERVICE_NAME",
          "value": "pmp-api"
        },
        {
          "name": "AWS_REGION",
          "value": "us-east-1"
        },
        {
          "name": "AWS_XRAY_DAEMON_ADDRESS",
          "value": "xray-daemon:2000"
        }
      ]
    }
  ]
}
```

## Verification

### 1. Check X-Ray Daemon

**EKS:**
```bash
# Check pods
kubectl get pods -n pmp -l app=xray-daemon

# Check logs
kubectl logs -n pmp -l app=xray-daemon
```

**ECS:**
```bash
# Check task
aws ecs describe-tasks --cluster pmp-cluster --tasks <task-id>

# Check logs
aws logs tail /ecs/pmp-api/xray --follow
```

### 2. Send Test Request

```bash
# API endpoint
curl https://api.pmp-application.com/api/health
```

### 3. View in X-Ray Console

```
https://console.aws.amazon.com/xray/home?region=us-east-1
```

**You should see:**
- Service map with nodes and connections
- Traces with segments
- Latency distribution
- Error rates

## Sampling Rules

### Create Custom Sampling Rules

In AWS X-Ray Console → Sampling → Create sampling rule:

```json
{
  "ruleName": "pmp-api-production",
  "priority": 1,
  "version": 1,
  "reservoirSize": 10,
  "fixedRate": 0.1,
  "urlPath": "*",
  "service": "pmp-api",
  "httpMethod": "*",
  "serviceType": "*",
  "host": "*"
}
```

**Or via AWS CLI:**
```bash
aws xray create-sampling-rule \
  --sampling-rule '{
    "ruleName": "pmp-api-production",
    "priority": 1,
    "version": 1,
    "reservoirSize": 10,
    "fixedRate": 0.1,
    "urlPath": "*",
    "service": "pmp-api",
    "httpMethod": "*",
    "serviceType": "*",
    "host": "*"
  }'
```

### High-Rule for Critical Paths

```json
{
  "ruleName": "pmp-api-critical",
  "priority": 2,
  "version": 1,
  "reservoirSize": 100,
  "fixedRate": 1.0,
  "urlPath": "/api/stripe*",
  "service": "pmp-api",
  "httpMethod": "*"
}
```

## Advanced Configuration

### Filter Sensitive Data

```typescript
// In your middleware or routes
import { trace } from '@opentelemetry/api';

export function sanitizeDataMiddleware(req, res, next) {
  const span = trace.getSpan(trace.context.active());

  if (span) {
    // Don't log sensitive data
    const sanitizedBody = { ...req.body };
    delete sanitizedBody.password;
    delete sanitizedBody.creditCard;

    span.setAttribute('http.body', JSON.stringify(sanitizedBody));
  }

  next();
}
```

### Add Custom Annotations

```typescript
import { trace } from '@opentelemetry/api';

function annotateTrace(metadata: {
  userId?: string;
  tier?: string;
  feature?: string;
}) {
  const span = trace.getActiveSpan();
  if (span) {
    // Annotations are indexed in X-Ray
    span.setAttribute('user.id', metadata.userId);
    span.setAttribute('user.tier', metadata.tier);
    span.setAttribute('feature.name', metadata.feature);

    // Metadata is not indexed
    span.setAttribute('metadata', JSON.stringify(metadata));
  }
}
```

### Error Tracking

```typescript
import { trace, SpanStatusCode } from '@opentelemetry/api';

export function recordError(error: Error, context: any) {
  const span = trace.getActiveSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });

    // Add error context
    span.setAttribute('error.type', error.constructor.name);
    span.setAttribute('error.context', JSON.stringify(context));
  }
}
```

## Monitoring

### CloudWatch Integration

X-Ray automatically sends metrics to CloudWatch:

**Key Metrics:**
- `Trace` - Trace count
- `Segment` - Segment count
- `Fault` - Error count
- `Error` - 4xx count
- `Throttle` - Throttled count
- `Latency` - Response time

**Create CloudWatch Dashboard:**

```bash
# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name pmp-tracing \
  --dashboard-body file://cloudwatch-dashboard.json
```

**Example dashboard widget:**
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/XRay", "Latency", "ServiceName", "pmp-api"],
          [".", "Fault", "ServiceName", "pmp-api"],
          [".", "Error", "ServiceName", "pmp-api"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "PMP API Tracing Metrics"
      }
    }
  ]
}
```

### Alarms

**Create alarm for high error rate:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name pmp-api-high-error-rate \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name Error \
  --namespace AWS/XRay \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## Cost Optimization

### Sampling Strategy

**Development:** 100% sampling
**Staging:** 50% sampling
**Production:** 10% sampling (adjust based on traffic)

**Estimated costs:**
- 1M traces/month ~ $5-10
- Adjust sampling to control costs

### Data Retention

Set up X-Ray data retention:
```
Console → X-Ray → Settings → Data retention
```

Options:
- Real-time only (0 days)
- 7 days
- 30 days (default)
- Custom (up to 90 days)

## Troubleshooting

### Missing Traces

**1. Check IAM permissions:**
```bash
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:role/pmp-api-task-role \
  --action-names xray:PutTraceSegments
```

**2. Check X-Ray daemon logs:**
```bash
kubectl logs -n pmp -l app=xray-daemon
```

**3. Verify network connectivity:**
```bash
# Test X-Ray endpoint
curl https://xray.us-east-1.amazonaws.com
```

### Sampling Not Working

**1. Check sampling rules:**
```bash
aws xray get-sampling-rules
```

**2. Verify rule priority:**
- Lower number = higher priority
- No conflicts in rules

**3. Test sampling:**
```bash
# Send 100 requests
for i in {1..100}; do
  curl https://api.pmp-application.com/api/health
done

# Check trace count in console
# Should be ~10 traces for 10% sampling
```

## Migration Checklist

- [ ] IAM policy created
- [ ] IAM role created and attached
- [ ] X-Ray daemon deployed
- [ ] OpenTelemetry config updated
- [ ] Environment variables set
- [ ] Sampling rules configured
- [ ] Test traces verified
- [ ] CloudWatch dashboard created
- [ ] Alarms configured
- [ ] Team trained on X-Ray console

## Resources

- [AWS X-Ray Documentation](https://docs.aws.amazon.com/xray/)
- [OpenTelemetry AWS X-Ray Exporter](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/exporter-aws-xray)
- [X-Ray Sampling Rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)
- [CloudWatch Metrics](https://docs.aws.amazon.com/xray/latest/devguide/xray-console.html)

## Support

For issues or questions:
1. Check X-Ray daemon logs
2. Verify IAM permissions
3. Test trace export manually
4. Consult full documentation

Happy tracing in production! 🚀
