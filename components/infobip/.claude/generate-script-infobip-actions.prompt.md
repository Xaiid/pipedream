# Agent Prompt: Create Script to Generate Infobip Actions

You are an expert JavaScript developer tasked with creating a new script that automatically generates Pipedream actions for the Infobip integration using the enhanced app methods.

Your task is to create a generation script that:

1. Analyzes the available methods in `infobip-enhanced.app.mjs`
2. Automatically creates well-structured Pipedream action files
3. Follows the established patterns and templates for consistent action generation

Infobip enhanced app file is located at: `components/infobip/infobip-enhanced.app.mjs`.

Infobip actions directory is located at: `components/infobip/actions/`.

## Available Generated Methods

The enhanced app contains methods from the OpenAPI specification. Each method includes comprehensive JSDoc documentation with:

- Summary and detailed description
- Parameter specifications (pathParams, pathQuery, data)
- External documentation links
- Return type information

## Script Requirements

The generation script must:

1. **Parse the enhanced app file** `infobip-enhanced.app.mjs` to extract method definitions and their JSDoc documentation
2. **Analyze existing actions** in `components/infobip/actions/` to identify which methods already have actions
3. **Generate missing actions** by creating files in the directory structure: `components/infobip/actions/[action-name]/[action-name].mjs`
4. **Follow the standard Pipedream action template** for consistent action generation
5. **Handle different method types** appropriately (SMS, WhatsApp, delivery reports, etc.)
6. **Map parameters correctly** based on method signatures and JSDoc annotations

## Script Implementation Guidelines

The generation script should:

1. **Read and parse** the enhanced app file to extract method information
2. **Scan existing actions** to avoid duplicates
3. **Generate action files** using the template structure below
4. **Create directories** as needed for each new action
5. **Apply proper formatting** and linting to generated files

## Standard Action Template

The script should generate actions using this exact template structure:

```javascript
import infobip from "../../infobip-enhanced.app.mjs";

export default {
  key: "infobip-[action-name]",
  name: "[Human Readable Name]",
  description:
    "[Description] [See the documentation](https://www.infobip.com/docs/api)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    // Use propDefinitions from enhanced app when available:
    // phoneNumber, text, from, to, messageId, applicationId, entityId
    phoneNumber: {
      propDefinition: [infobip, "phoneNumber"],
      optional: false, // Set based on method requirements
    },
    // Add custom props based on method's JSDoc @param documentation
    customParam: {
      type: "string", // or "boolean", "array", "object"
      label: "Custom Parameter",
      description: "Description from method's JSDoc",
      optional: true,
    },
  },
  async run({ $ }) {
    const { infobip, ...params } = this;

    // Call the enhanced app method based on requirements:
    // - Use pathParams for path parameters like {messageId}
    // - Use pathQuery for query parameters
    // - Use data for request body
    const response = await infobip.methodName({
      $,
      // Structure according to method's parameter requirements
      data: {
        // Request body structure from method documentation
      },
      pathParams: [{ name: "paramName", value: params.paramValue }],
      pathQuery: [{ name: "queryName", value: params.queryValue }],
    });

    $.export(
      "$summary",
      `Action completed: ${response.status?.description || "Success"}`
    );
    return response;
  },
};
```

## Method Usage Patterns

Based on existing actions, follow these patterns when calling enhanced app methods:

### SMS Methods

```javascript
// For sendSmsMessages() - Use data with messages array
await infobip.sendSmsMessages({
  $,
  data: {
    messages: [
      {
        destinations: [{ to: phoneNumber }],
        text,
        // other message properties
      },
    ],
  },
});
```

### Single Message Methods

```javascript
// For methods like sendWhatsappMessage() - Use data at root level
await infobip.sendWhatsappMessage({
  $,
  data: {
    content: { text },
    from,
    to,
    // other properties
  },
});
```

### Methods with Path Parameters

```javascript
// For methods like logEndTag() with {messageId}
await infobip.logEndTag({
  $,
  pathParams: [{ name: "messageId", value: messageId }],
});
```

## Available Enhanced App Resources

### Prop Definitions (Reusable)

Use these existing prop definitions from the enhanced app:

- `phoneNumber` - Standard phone number input (international format)
- `text` - Message text content
- `from` - Sender identification
- `to` - Destination address
- `messageId` - Message identifier
- `resourceKey` - For resource management (with async options)

Prop definitions should be mapped to the corresponding request body or parameters as needed from the OpenAPI spec.

### Generated Methods Categories

The enhanced app contains these method categories you can use:

**SMS Messaging**: `sendSmsMessages()`, `sendSmsMessage()`, `previewSmsMessage()`
**SMS Management**: `getScheduledSmsMessages()`, `rescheduleSmsMessages()`, `updateScheduledSmsMessagesStatus()`
**Delivery & Logs**: `getOutboundSmsMessageDeliveryReports()`, `getOutboundSmsMessageLogs()`, `getInboundSmsMessages()`
**Conversion**: `logEndTag()`

## Script Development Guidelines

The generation script should follow these requirements when creating new actions:

### Automated Method Analysis

The script should automatically:

1. **Parse JSDoc comments** from methods in `infobip-enhanced.app.mjs` to extract parameters and functionality
2. **Identify parameter types**: `pathParams` (for URL path variables like `{messageId}`), `pathQuery` (for query strings), and `data` (for request body)
3. **Map to appropriate prop definitions** from the enhanced app when possible
4. **Generate custom props** for method-specific parameters not covered by existing prop definitions

### Automated Code Generation Standards

The script should ensure generated actions follow these standards:

- **Import**: Always use `import infobip from "../../infobip-enhanced.app.mjs"`
- **Key naming**: Use format `"infobip-[action-name]"` (kebab-case)
- **Description**: Include link to Infobip documentation
- **Props**: Automatically leverage existing propDefinitions, set `optional` correctly based on method requirements
- **Error handling**: The `$` parameter provides automatic error handling
- **Summary**: Always export meaningful summary using `$.export("$summary", "...")`

### Automated Parameter Mapping

The script should automatically map method parameters:

- **Path parameters** (`{messageId}`) → `pathParams: [{ name: "messageId", value: messageId }]`
- **Query parameters** → `pathQuery: [{ name: "limit", value: "10" }]`
- **Request body** → `data: { /* request structure */ }`

### Data Structure Handling

The script should:

- Analyze openAPI spec file to understand request body structures
- Explicitly define nested objects and arrays in the `data` parameter based on method documentation

### Automated Method Selection

The script should:

- Prefer latest API versions (v3 over v2 when available)
- Use the most appropriate method based on the use case
- Reference the JSDoc comments for usage guidance
- Skip methods that already have corresponding actions

## Script Output and Formatting

The generation script should:

1. **Create action files** in the correct directory structure
2. **Apply proper formatting** using the project's coding standards
3. **Run linting** on generated files using `eslint.config.mjs`
4. **Report results** showing which actions were created
5. **Handle errors gracefully** if action generation fails

## Script Location

Create the generation script as: `components/infobip/generate-actions.mjs`
