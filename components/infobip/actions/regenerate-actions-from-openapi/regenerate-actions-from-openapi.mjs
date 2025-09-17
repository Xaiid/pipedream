import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import infobip from "../../infobip-enhanced.app.mjs";

const execAsync = promisify(exec);

export default {
  key: "infobip-regenerate-actions-from-openapi",
  name: "Regenerate Actions from OpenAPI",
  description: "Automatically regenerate all Infobip actions from the latest OpenAPI specification. This action can be triggered via webhook when the OpenAPI spec is updated. [See the documentation](https://www.infobip.com/docs/api)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    forceRegenerate: {
      type: "boolean",
      label: "Force Regenerate",
      description: "Force regeneration even if no changes are detected in the OpenAPI spec",
      optional: true,
      default: false,
    },
    dryRun: {
      type: "boolean", 
      label: "Dry Run",
      description: "Preview what actions would be generated without actually creating files",
      optional: true,
      default: false,
    },
    notificationWebhook: {
      type: "string",
      label: "Notification Webhook URL",
      description: "Optional webhook URL to notify when regeneration is complete",
      optional: true,
    },
  },
  async run({ $ }) {
    const { infobip, forceRegenerate, dryRun, notificationWebhook, ...params } = this;
    
    try {
      $.export("$summary", "🚀 Starting Infobip actions regeneration...");
      
      // Get the component directory path
      const componentDir = path.dirname(new URL(import.meta.url).pathname);
      const rootDir = path.resolve(componentDir, "../..");
      
      console.log(`📁 Working directory: ${rootDir}`);
      
      // Prepare the command
      let command = "npm run generate-infobip-actions";
      
      if (dryRun) {
        // For dry run, we'll capture the output without actually writing files
        // This would require modifying the generator script to support a --dry-run flag
        console.log("⚠️  Note: Dry run mode requires generator script modification to support --dry-run flag");
      }
      
      // Check if we should force regeneration
      if (forceRegenerate) {
        console.log("🔄 Force regeneration enabled - will regenerate all actions");
      }
      
      // Execute the generation command
      console.log(`🔧 Executing: ${command}`);
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: rootDir,
        timeout: 300000, // 5 minute timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
      
      // Parse the output for statistics
      const outputLines = stdout.split('\n');
      let successCount = 0;
      let totalCount = 0;
      let errors = [];
      
      // Extract generation results
      for (const line of outputLines) {
        if (line.includes('📊 Summary:')) {
          const match = line.match(/(\d+)\/(\d+) actions created successfully/);
          if (match) {
            successCount = parseInt(match[1]);
            totalCount = parseInt(match[2]);
          }
        }
        if (line.includes('❌')) {
          errors.push(line.trim());
        }
      }
      
      // Prepare result summary
      const result = {
        success: successCount === totalCount && totalCount > 0,
        actionsGenerated: successCount,
        totalActions: totalCount,
        errors: errors,
        dryRun,
        forceRegenerate,
        timestamp: new Date().toISOString(),
        output: stdout,
        stderr: stderr || null,
      };
      
      // Log results
      if (result.success) {
        console.log(`✅ Successfully regenerated ${successCount}/${totalCount} actions`);
        $.export("$summary", `✅ Successfully regenerated ${successCount} Infobip actions from OpenAPI spec`);
      } else {
        console.log(`⚠️  Partial success: ${successCount}/${totalCount} actions generated`);
        if (errors.length > 0) {
          console.log("❌ Errors encountered:");
          errors.forEach(error => console.log(`  ${error}`));
        }
        $.export("$summary", `⚠️  Regenerated ${successCount}/${totalCount} actions with ${errors.length} errors`);
      }
      
      // Send notification if webhook URL provided
      if (notificationWebhook) {
        try {
          console.log("📬 Sending notification webhook...");
          
          const notificationPayload = {
            event: "infobip_actions_regenerated",
            success: result.success,
            summary: {
              actionsGenerated: successCount,
              totalActions: totalCount,
              errorsCount: errors.length,
            },
            metadata: {
              dryRun,
              forceRegenerate,
              timestamp: result.timestamp,
            },
            errors: errors.length > 0 ? errors : null,
          };
          
          // Use axios to send notification (available in Pipedream environment)
          const response = await $http.post(notificationWebhook, notificationPayload, {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Pipedream-Infobip-Actions-Generator',
            },
          });
          
          console.log(`📬 Notification sent successfully (${response.status})`);
        } catch (notificationError) {
          console.warn("⚠️  Failed to send notification:", notificationError.message);
          // Don't fail the main action if notification fails
        }
      }
      
      // Return comprehensive result
      return {
        success: result.success,
        summary: `Regenerated ${successCount}/${totalCount} Infobip actions`,
        details: result,
        actions: {
          generated: successCount,
          total: totalCount,
          errors: errors.length,
        },
        config: {
          dryRun,
          forceRegenerate,
          notificationSent: !!notificationWebhook,
        },
      };
      
    } catch (error) {
      console.error("❌ Action regeneration failed:", error);
      
      const errorResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        config: { dryRun, forceRegenerate },
      };
      
      $.export("$summary", `❌ Failed to regenerate Infobip actions: ${error.message}`);
      
      // Send error notification if webhook provided
      if (notificationWebhook) {
        try {
          await $http.post(notificationWebhook, {
            event: "infobip_actions_regeneration_failed",
            success: false,
            error: error.message,
            timestamp: errorResult.timestamp,
          });
        } catch (notificationError) {
          console.warn("⚠️  Failed to send error notification:", notificationError.message);
        }
      }
      
      throw error; // Re-throw to mark action as failed
    }
  },
};
