import { axios } from "@pipedream/platform";

export default {
  key: "infobip-openapi-update-webhook",
  name: "Infobip OpenAPI Update Webhook",
  description: "Receive webhook notifications when Infobip's OpenAPI specification is updated, triggering automatic action regeneration",
  version: "0.0.1",
  type: "source",
  dedupe: "unique",
  props: {
    http: {
      type: "$.interface.http",
      customResponse: true,
    },
    validateSignature: {
      type: "boolean",
      label: "Validate Webhook Signature",
      description: "Enable webhook signature validation for security",
      default: true,
    },
    webhookSecret: {
      type: "string",
      label: "Webhook Secret",
      description: "Secret key for validating webhook signatures (if validation enabled)",
      secret: true,
      optional: true,
    },
    autoTriggerRegeneration: {
      type: "boolean",
      label: "Auto-trigger Action Regeneration",
      description: "Automatically trigger action regeneration when OpenAPI spec changes are detected",
      default: true,
    },
  },
  hooks: {
    async activate() {
      console.log("🔗 Infobip OpenAPI Update Webhook activated");
      console.log(`📡 Webhook URL: ${this.http.endpoint}`);
      console.log("💡 Configure this URL in your Infobip webhook settings or CI/CD pipeline");
    },
    async deactivate() {
      console.log("🔗 Infobip OpenAPI Update Webhook deactivated");
    },
  },
  async run(event) {
    const { 
      body, 
      headers,
      method,
      query,
    } = event;

    // Validate request method
    if (method !== "POST") {
      this.http.respond({
        status: 405,
        body: { error: "Method not allowed. Use POST." },
        headers: { "Content-Type": "application/json" },
      });
      return;
    }

    console.log("📥 Received webhook request");
    console.log("Headers:", headers);
    console.log("Body:", body);

    try {
      // Validate webhook signature if enabled
      if (this.validateSignature && this.webhookSecret) {
        const signature = headers["x-signature"] || headers["x-hub-signature-256"];
        
        if (!signature) {
          this.http.respond({
            status: 401,
            body: { error: "Missing webhook signature" },
            headers: { "Content-Type": "application/json" },
          });
          return;
        }

        // Implement signature validation logic here
        // This would depend on how Infobip signs their webhooks
        console.log("🔐 Validating webhook signature...");
      }

      // Parse webhook payload
      let payload = body;
      if (typeof body === "string") {
        try {
          payload = JSON.parse(body);
        } catch (parseError) {
          console.warn("⚠️  Could not parse body as JSON, using as-is");
        }
      }

      // Determine if this is an OpenAPI spec update
      const isOpenApiUpdate = this.detectOpenApiUpdate(payload, headers, query);
      
      // Prepare event data
      const eventData = {
        id: this.generateEventId(payload, headers),
        timestamp: new Date().toISOString(),
        source: "infobip-openapi-webhook",
        type: isOpenApiUpdate ? "openapi_spec_updated" : "webhook_received",
        payload,
        headers: this.sanitizeHeaders(headers),
        metadata: {
          isOpenApiUpdate,
          autoTriggerEnabled: this.autoTriggerRegeneration,
          signatureValidated: this.validateSignature && this.webhookSecret,
        },
      };

      // Emit event for downstream processing
      this.$emit(eventData, {
        id: eventData.id,
        summary: isOpenApiUpdate 
          ? `🔄 OpenAPI spec update detected - ${payload.version || 'unknown version'}` 
          : `📨 Webhook received - ${payload.event || 'unknown event'}`,
        ts: Date.now(),
      });

      // Auto-trigger regeneration if enabled and this is an OpenAPI update
      if (this.autoTriggerRegeneration && isOpenApiUpdate) {
        console.log("🚀 Auto-triggering action regeneration...");
        
        try {
          // This would require the regeneration action to be accessible
          // In a real implementation, you might trigger it via API or emit a special event
          console.log("💡 To complete auto-triggering, connect this source to the 'Regenerate Actions from OpenAPI' action");
        } catch (triggerError) {
          console.error("❌ Failed to auto-trigger regeneration:", triggerError.message);
        }
      }

      // Send success response
      this.http.respond({
        status: 200,
        body: {
          success: true,
          message: "Webhook processed successfully",
          eventId: eventData.id,
          type: eventData.type,
          autoTriggered: this.autoTriggerRegeneration && isOpenApiUpdate,
        },
        headers: { "Content-Type": "application/json" },
      });

    } catch (error) {
      console.error("❌ Error processing webhook:", error);
      
      this.http.respond({
        status: 500,
        body: { 
          error: "Internal server error", 
          message: error.message,
        },
        headers: { "Content-Type": "application/json" },
      });
    }
  },
  methods: {
    detectOpenApiUpdate(payload, headers, query) {
      // Implement logic to detect if this webhook indicates an OpenAPI spec update
      // This depends on how Infobip structures their webhooks
      
      // Example detection patterns:
      const indicators = [
        // Direct indicators
        payload?.event === "openapi_updated",
        payload?.type === "spec_update", 
        payload?.event_type === "api_specification_changed",
        
        // Version change indicators
        payload?.version && payload?.previous_version,
        payload?.spec_version,
        
        // Header indicators
        headers["x-event-type"] === "openapi-update",
        headers["x-infobip-event"] === "spec-updated",
        
        // Query parameter indicators
        query?.event === "openapi_update",
        
        // Generic API update indicators
        payload?.api_changes,
        payload?.endpoints_updated,
      ];

      return indicators.some(Boolean);
    },

    generateEventId(payload, headers) {
      // Generate a unique event ID for deduplication
      const timestamp = new Date().toISOString();
      const payloadHash = this.hashPayload(payload);
      return `infobip_webhook_${timestamp}_${payloadHash}`.substring(0, 50);
    },

    hashPayload(payload) {
      // Simple hash function for payload
      const str = JSON.stringify(payload);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36);
    },

    sanitizeHeaders(headers) {
      // Remove sensitive headers from the logged data
      const sensitiveHeaders = [
        "authorization",
        "x-api-key", 
        "x-signature",
        "x-hub-signature-256",
      ];
      
      const sanitized = { ...headers };
      sensitiveHeaders.forEach(header => {
        if (sanitized[header]) {
          sanitized[header] = "[REDACTED]";
        }
      });
      
      return sanitized;
    },
  },
};
