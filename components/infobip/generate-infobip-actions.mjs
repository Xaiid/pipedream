import fs from "fs/promises";
import path from "path";

/**
 * Script to automatically generate Pipedream actions for Infobip enhanced app methods
 * Parses the enhanced app file and creates action files for methods without existing actions
 */

const ENHANCED_APP_PATH = "./infobip-enhanced.app.mjs";
const ACTIONS_DIR = "./actions";
const ACTION_TEMPLATE_PATH = "../../infobip-enhanced.app.mjs";

// Methods that should be skipped during generation
const SKIP_METHODS = new Set([
  "_baseUrl",
  "_headers",
  "_makeRequest",
  "listApplications",
  "listEntities",
  "listResources",
  "sendSms",
  "sendViberMessage",
  "sendWhatsappMessage",
  "createHook",
  "deleteHook",
  "previewSmsMessage", // Already has existing action
]);

// Map method names to human-readable action names
const METHOD_NAME_MAP = {
  sendSmsMessagesOverQueryParameters: "Send SMS Messages Over Query Parameters",
  sendSmsMessageOverQueryParameters: "Send SMS Message Over Query Parameters",
  sendSmsMessage: "Send SMS Message V2",
  sendBinarySmsMessage: "Send Binary SMS Message",
  getScheduledSmsMessages: "Get Scheduled SMS Messages",
  rescheduleSmsMessages: "Reschedule SMS Messages",
  getScheduledSmsMessagesStatus: "Get Scheduled SMS Messages Status",
  updateScheduledSmsMessagesStatus: "Update Scheduled SMS Messages Status",
  logEndTag: "Confirm Conversion (Log End Tag)",
  getInboundSmsMessages: "Get Inbound SMS Messages",
  getOutboundSmsMessageDeliveryReportsV3: "Get Outbound SMS Message Delivery Reports V3",
  getOutboundSmsMessageLogsV3: "Get Outbound SMS Message Logs V3",
  getOutboundSmsMessageDeliveryReports: "Get Outbound SMS Message Delivery Reports",
  getOutboundSmsMessageLogs: "Get Outbound SMS Message Logs",
};

// Map method names to kebab-case for action keys
function methodNameToKebabCase(methodName) {
  return methodName
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
}

// Extract JSDoc comment and method signature from method text
function parseMethodInfo(methodText) {
  const jsdocMatch = methodText.match(/\/\*\*([\s\S]*?)\*\//);
  const methodMatch = methodText.match(/(\w+)\(opts = {}\)/);

  if (!jsdocMatch || !methodMatch) return null;

  const jsdoc = jsdocMatch[1];
  const methodName = methodMatch[1];

  // Extract summary (first non-empty line)
  const summaryMatch = jsdoc.match(/\*\s*([^\n\r@]+)/);
  const summary = summaryMatch
    ? summaryMatch[1].trim()
    : "";

  // Extract description (everything before @see or @param)
  const descMatch = jsdoc.match(/\*\s*([\s\S]*?)(?:\*\s*@see|\*\s*@param|\*\/)/);
  let description = descMatch
    ? descMatch[1].replace(/\*\s*/g, "").replace(/\s+/g, " ")
      .trim()
    : "";

  // Clean up description - remove extra whitespace and line breaks
  description = description.replace(/\n/g, " ").replace(/\s+/g, " ")
    .trim();

  // Extract external documentation link
  const seeMatch = jsdoc.match(/@see\s*\{@link\s*(.*?)\|/);
  const externalDoc = seeMatch
    ? seeMatch[1]
    : "https://www.infobip.com/docs/api";

  // Extract parameter info from @param annotation
  const paramMatch = jsdoc.match(/@param\s*\{\{([\s\S]*?)\}\}/);
  let hasData = false;
  let hasPathParams = false;
  let hasPathQuery = false;
  let paramDetails = {};

  if (paramMatch) {
    const paramText = paramMatch[1];
    hasData = paramText.includes("data?:") && (paramText.includes("required") || paramText.includes("Request body"));
    hasPathParams = paramText.includes("pathParams");
    hasPathQuery = paramText.includes("pathQuery");

    // Extract specific parameter details for better prop generation
    paramDetails = {
      hasData,
      hasPathParams,
      hasPathQuery,
      requiresPhoneNumber: hasData && (paramText.includes("\"to\"") || paramText.includes("destinations")),
      requiresText: hasData && paramText.includes("\"text\""),
      requiresFrom: hasData && paramText.includes("\"from\""),
      hasMessageId: hasPathParams && paramText.includes("messageId"),
      hasQueryParams: hasPathQuery && (paramText.includes("limit") || paramText.includes("query")),
      isRequired: paramText.includes("required"),
      hasApplicationId: hasData && paramText.includes("applicationId"),
      hasEntityId: hasData && paramText.includes("entityId"),
    };
  }

  return {
    methodName,
    summary,
    description,
    externalDoc,
    hasData,
    hasPathParams,
    hasPathQuery,
    paramDetails,
  };
}

// Generate props based on method characteristics following exact template
function generateProps(methodInfo) {
  const props = [
    "infobip",
  ];

  const {
    methodName, hasData, paramDetails,
  } = methodInfo;

  // Phone number prop for methods that need destinations
  if (paramDetails?.requiresPhoneNumber) {
    props.push(`
    phoneNumber: {
      propDefinition: [infobip, "phoneNumber"],
      optional: false,
    }`);
  }

  // Text content prop for messaging methods
  if (paramDetails?.requiresText) {
    props.push(`
    text: {
      propDefinition: [infobip, "text"],
      optional: false,
    }`);
  }

  // From sender prop for messaging methods
  if (paramDetails?.requiresFrom) {
    props.push(`
    from: {
      propDefinition: [infobip, "from"],
      optional: true,
    }`);
  }

  // Message ID prop for methods with path parameters
  if (paramDetails?.hasMessageId) {
    props.push(`
    messageId: {
      propDefinition: [infobip, "messageId"],
      optional: false,
    }`);
  }

  // Add common optional props for SMS sending methods
  if (methodName.includes("send") && hasData) {
    props.push(`
    applicationId: {
      propDefinition: [infobip, "applicationId"],
      optional: true,
    },
    entityId: {
      propDefinition: [infobip, "entityId"],
      optional: true,
    }`);
  }

  // Add query parameter props for methods that support them
  if (paramDetails?.hasQueryParams || methodName.includes("get") || methodName.includes("Schedule")) {
    props.push(`
    limit: {
      type: "integer",
      label: "Limit",
      description: "Maximum number of results to return. Default is 50.",
      optional: true,
      default: 50,
    }`);
  }

  return props.join(",");
}

// Generate the run method based on method characteristics following exact template
function generateRunMethod(methodInfo) {
  const {
    methodName, hasData, hasPathParams, hasPathQuery, paramDetails,
  } = methodInfo;

  let methodCall = "";
  let destructuring;

  // Handle path parameters (like messageId)
  if (hasPathParams) {
    if (paramDetails?.hasMessageId) {
      destructuring = "const { infobip, messageId, ...params } = this;";
      methodCall = `
    const response = await infobip.${methodName}({
      $,
      pathParams: [{ name: "messageId", value: messageId }],
    });`;
    } else {
      destructuring = "const { infobip, ...params } = this;";
      methodCall = `
    const response = await infobip.${methodName}({
      $,
      pathParams: params.pathParams || [],
    });`;
    }
  }
  // Handle methods with request body data
  else if (hasData) {
    if (methodName.includes("sendSmsMessages") || methodName.includes("SendSmsMessages")) {
      destructuring = "const { infobip, phoneNumber, text, from, applicationId, entityId, ...params } = this;";
      methodCall = `
    const response = await infobip.${methodName}({
      $,
      data: {
        messages: [
          {
            destinations: [{ to: phoneNumber }],
            text,
            ...(from && { from }),
            ...(applicationId && { applicationId }),
            ...(entityId && { entityId }),
          },
        ],
      },
    });`;
    } else if (methodName.includes("sendSmsMessage") && !methodName.includes("Messages")) {
      destructuring = "const { infobip, phoneNumber, text, from, applicationId, entityId, ...params } = this;";
      methodCall = `
    const response = await infobip.${methodName}({
      $,
      data: {
        to: phoneNumber,
        text,
        ...(from && { from }),
        ...(applicationId && { applicationId }),
        ...(entityId && { entityId }),
        ...params,
      },
    });`;
    } else {
      destructuring = "const { infobip, ...params } = this;";
      methodCall = `
    const response = await infobip.${methodName}({
      $,
      data: {
        ...params,
      },
    });`;
    }
  }
  // Handle methods with query parameters
  else if (hasPathQuery) {
    destructuring = "const { infobip, limit, ...params } = this;";
    methodCall = `
    const pathQuery = [];
    if (limit) pathQuery.push({ name: "limit", value: limit.toString() });

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        pathQuery.push({ name: key, value: value.toString() });
      }
    });

    const response = await infobip.${methodName}({
      $,
      pathQuery: pathQuery.length > 0 ? pathQuery : undefined,
    });`;
  }
  // Simple methods with no parameters
  else {
    destructuring = "const { infobip } = this;";
    methodCall = `
    const response = await infobip.${methodName}({ $ });`;
  }

  // Generate summary based on method type
  let summary = "Action completed";
  if (methodName.includes("send")) {
    summary = "Message sent successfully";
  } else if (methodName.includes("get")) {
    summary = "Data retrieved successfully";
  } else if (methodName.includes("preview")) {
    summary = "Preview generated successfully";
  } else if (methodName.includes("reschedule") || methodName.includes("update")) {
    summary = "Update completed successfully";
  } else if (methodName.includes("logEndTag")) {
    summary = "Conversion logged successfully";
  }

  return `
  async run({ $ }) {
    ${destructuring}
${methodCall}

    $.export(
      "$summary",
      \`${summary}: \${response.status?.description || "Success"}\`
    );
    return response;
  },`;
}

// Generate complete action file content following the exact template from prompt
function generateActionFile(methodInfo) {
  const actionName = METHOD_NAME_MAP[methodInfo.methodName] || methodInfo.summary;
  const kebabName = methodNameToKebabCase(methodInfo.methodName);
  const props = generateProps(methodInfo);
  const runMethod = generateRunMethod(methodInfo);

  let description = methodInfo.description;
  if (description.length > 200) {
    description = description.substring(0, 197) + "...";
  }

  return `import infobip from "${ACTION_TEMPLATE_PATH}";

export default {
  key: "infobip-${kebabName}",
  name: "${actionName}",
  description:
    "${description} [See the documentation](${methodInfo.externalDoc})",
  version: "0.0.1",
  type: "action",
  props: {
    ${props}
  },${runMethod}
};
`;
}

// Scan existing actions directory to identify what's already created
async function scanExistingActions() {
  const existingActions = new Set();

  try {
    const actionDirs = await fs.readdir(ACTIONS_DIR, {
      withFileTypes: true,
    });

    for (const dirent of actionDirs) {
      if (dirent.isDirectory() && dirent.name.startsWith("infobip-")) {
        // Extract method name from action directory name
        const actionName = dirent.name.replace("infobip-", "");
        const methodName = actionName.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        existingActions.add(methodName);
      }
    }
  } catch (error) {
    console.warn("Could not scan actions directory:", error.message);
  }

  return existingActions;
}

// Extract methods from the enhanced app file
async function extractMethods() {
  try {
    const content = await fs.readFile(ENHANCED_APP_PATH, "utf8");
    const existingActions = await scanExistingActions();

    // Find the methods section
    const methodsMatch = content.match(/methods:\s*{([\s\S]*?)},\s*};/);
    if (!methodsMatch) {
      throw new Error("Could not find methods section in enhanced app file");
    }

    const methodsContent = methodsMatch[1];

    // Extract individual methods with their JSDoc comments
    const methodPattern = /\/\*\*([\s\S]*?)\*\/[\s\S]*?(\w+)\(opts = {}\)\s*{[\s\S]*?(?=\n {4}[\w\\/]|\n {2}},|$)/g;
    const methods = [];
    let regexMatch;

    while ((regexMatch = methodPattern.exec(methodsContent)) !== null) {
      const fullMethodText = regexMatch[0];
      const methodInfo = parseMethodInfo(fullMethodText);

      if (methodInfo &&
          !SKIP_METHODS.has(methodInfo.methodName) &&
          !existingActions.has(methodInfo.methodName)) {
        methods.push(methodInfo);
      }
    }

    return methods;
  } catch (error) {
    console.error("Error extracting methods:", error.message);
    return [];
  }
}

// Create action directory and file with proper error handling
async function createActionFile(methodInfo) {
  const kebabName = methodNameToKebabCase(methodInfo.methodName);
  const actionDir = path.join(ACTIONS_DIR, `infobip-${kebabName}`);
  const actionFile = path.join(actionDir, `infobip-${kebabName}.mjs`);

  try {
    // Validate method info
    if (!methodInfo.methodName || !methodInfo.summary) {
      throw new Error("Invalid method info: missing required fields");
    }

    // Create directory if it doesn't exist
    await fs.mkdir(actionDir, {
      recursive: true,
    });

    // Generate and write action file
    const actionContent = generateActionFile(methodInfo);

    // Validate generated content
    if (!actionContent || actionContent.trim().length === 0) {
      throw new Error("Generated action content is empty");
    }

    await fs.writeFile(actionFile, actionContent, "utf8");

    console.log(`✅ Created action: ${path.relative(process.cwd(), actionFile)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create action for ${kebabName}:`, error.message);
    return false;
  }
}

// Main execution function
async function generateActions() {
  console.log("🚀 Starting Infobip action generation...\n");

  try {
    // Extract methods from enhanced app
    const methods = await extractMethods();

    if (methods.length === 0) {
      console.log("✅ No new methods found to generate actions for. All methods already have corresponding actions.");
      return;
    }

    console.log(`Found ${methods.length} methods to generate actions for:\n`);

    methods.forEach((method) => {
      const kebabName = methodNameToKebabCase(method.methodName);
      console.log(`  - ${method.methodName} → infobip-${kebabName}`);
    });

    console.log("\n📝 Generating action files...\n");

    // Generate actions
    let successCount = 0;
    const errors = [];

    for (const method of methods) {
      try {
        const success = await createActionFile(method);
        if (success) {
          successCount++;
        } else {
          errors.push(`Failed to create action for ${method.methodName}`);
        }
      } catch (error) {
        errors.push(`Error creating action for ${method.methodName}: ${error.message}`);
      }
    }

    console.log("\n✨ Action generation complete!");
    console.log(`📊 Summary: ${successCount}/${methods.length} actions created successfully`);

    if (errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (successCount > 0) {
      console.log("\n🔧 Next steps:");
      console.log("  1. Review the generated action files");
      console.log("  2. Run ESLint to fix any formatting issues: npm run lint");
      console.log("  3. Test the actions in your Pipedream workspace");
      console.log("  4. Update descriptions and props as needed");
    }
  } catch (error) {
    console.error("❌ Fatal error during action generation:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateActions().catch(console.error);
}

export {
  generateActions,
};
