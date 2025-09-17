# Webhook-Triggered Action Regeneration

This document explains how to set up automatic regeneration of Infobip actions when the OpenAPI specification is updated.

## 🎯 Overview

The webhook automation consists of two components:

1. **Webhook Source**: `infobip-openapi-update-webhook` - Receives notifications about OpenAPI spec updates
2. **Regeneration Action**: `infobip-regenerate-actions-from-openapi` - Automatically regenerates all actions from the latest OpenAPI spec

## 🔧 Setup Instructions

### 1. Deploy the Webhook Source

1. Create a new Pipedream workflow
2. Add the "Infobip OpenAPI Update Webhook" source
3. Configure the webhook settings:
   - **Validate Webhook Signature**: Enable for security
   - **Webhook Secret**: Set a secret key for signature validation
   - **Auto-trigger Regeneration**: Enable to automatically trigger action updates

4. Copy the generated webhook URL from the source

### 2. Connect the Regeneration Action

1. In the same workflow, add the "Regenerate Actions from OpenAPI" action
2. Configure the action settings:
   - **Force Regenerate**: Set to `false` for normal operation
   - **Dry Run**: Set to `false` for actual regeneration
   - **Notification Webhook**: Optional URL to receive completion notifications

3. Connect the webhook source to trigger this action

### 3. Configure Webhook Triggers

You can trigger the webhook from several sources:

#### Option A: CI/CD Pipeline Integration
```yaml
# GitHub Actions example
name: Trigger Infobip Actions Update
on:
  schedule:
    - cron: '0 0 * * *'  # Daily check
  workflow_dispatch:

jobs:
  check-openapi-updates:
    runs-on: ubuntu-latest
    steps:
      - name: Check Infobip OpenAPI Version
        run: |
          CURRENT_VERSION=$(curl -s https://api.infobip.com/platform/1/openapi/sms | jq -r '.info.version')
          # Compare with stored version and trigger webhook if different
          curl -X POST "${{ secrets.PIPEDREAM_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{"event": "openapi_updated", "version": "'$CURRENT_VERSION'"}'
```

#### Option B: Manual Webhook Trigger
```bash
# Trigger regeneration manually
curl -X POST "https://your-webhook-url.m.pipedream.net" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "openapi_updated",
    "version": "3.43.0",
    "trigger": "manual",
    "force_regenerate": true
  }'
```

#### Option C: Monitoring Service Integration
```javascript
// Example monitoring script
const checkOpenAPIVersion = async () => {
  const response = await fetch('https://api.infobip.com/platform/1/openapi/sms');
  const spec = await response.json();
  
  const currentVersion = spec.info.version;
  const storedVersion = await getStoredVersion(); // Your storage mechanism
  
  if (currentVersion !== storedVersion) {
    // Trigger webhook
    await fetch(process.env.PIPEDREAM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'openapi_updated',
        version: currentVersion,
        previous_version: storedVersion,
        timestamp: new Date().toISOString()
      })
    });
    
    await storeVersion(currentVersion);
  }
};
```

## 📋 Webhook Payload Examples

### OpenAPI Update Notification
```json
{
  "event": "openapi_updated",
  "version": "3.44.0",
  "previous_version": "3.43.0",
  "changes": [
    "Added new SMS delivery endpoint",
    "Updated message status enum values"
  ],
  "timestamp": "2025-01-15T10:30:00Z",
  "spec_url": "https://api.infobip.com/platform/1/openapi/sms"
}
```

### Manual Trigger
```json
{
  "event": "manual_regeneration",
  "trigger": "user_request",
  "force_regenerate": true,
  "requested_by": "developer@company.com",
  "timestamp": "2025-01-15T14:45:00Z"
}
```

## 🔐 Security Considerations

### Webhook Signature Validation
The webhook source supports signature validation. Configure it properly:

1. Set a strong webhook secret
2. Enable signature validation
3. Ensure your webhook sender includes the signature header

### Access Control
- Use environment variables for sensitive configuration
- Limit webhook access to trusted sources
- Monitor webhook activity for suspicious patterns

## 📊 Monitoring and Notifications

### Success Notifications
When regeneration completes successfully, you'll receive:
- Summary of actions generated
- List of any errors encountered
- Timestamp of completion

### Error Notifications
If regeneration fails:
- Error details and stack trace
- Configuration used during attempt
- Suggested remediation steps

### Example Notification Payload
```json
{
  "event": "infobip_actions_regenerated",
  "success": true,
  "summary": {
    "actionsGenerated": 15,
    "totalActions": 15,
    "errorsCount": 0
  },
  "metadata": {
    "dryRun": false,
    "forceRegenerate": false,
    "timestamp": "2025-01-15T10:35:24Z"
  }
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Actions not regenerating**
   - Check webhook source is receiving events
   - Verify action is connected to source
   - Review action logs for errors

2. **Signature validation failing**
   - Ensure webhook secret matches
   - Check signature header format
   - Verify signing algorithm

3. **Permission errors during generation**
   - Check file system permissions
   - Verify npm/node access
   - Review working directory paths

### Debug Mode
Enable debug logging by setting action to "Dry Run" mode to see what would happen without making changes.

## 🔄 Workflow Examples

### Basic Automation Workflow
```
[Webhook Source] → [Regenerate Actions] → [Notification]
```

### Advanced Workflow with Validation
```
[Webhook Source] → [Validate Changes] → [Dry Run Test] → [Regenerate Actions] → [Deploy to Staging] → [Run Tests] → [Deploy to Production] → [Notifications]
```

## 📚 Additional Resources

- [Infobip OpenAPI Documentation](https://www.infobip.com/docs/api)
- [Pipedream Webhook Sources](https://pipedream.com/docs/sources/)
- [GitHub Webhooks](https://docs.github.com/en/developers/webhooks-and-events/webhooks)

## 🤝 Contributing

To improve the webhook automation:
1. Test with different webhook payload formats
2. Add support for additional trigger sources
3. Enhance error handling and retry logic
4. Improve notification formatting and content
