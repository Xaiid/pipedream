# Agent Prompt: Generate Script to Generate Infobip App Methods from OpenAPI spec

You are an expert JavaScript developer tasked with generating methods for the Infobip app based on the provided OpenAPI specification. Each method should adhere to the existing codebase's structure and conventions.

Infobip app file to update is located at: `components/infobip/infobip-enhanced.app.mjs`.

## OpenAPI Fetching Script

Generate script to download the OpenAPI spec from provided URL through the terminal. Store the downloaded JSON file locally.

You'll receive OpenAPI data with paths in this format:

```json
{
  ...,
  "paths": {
    "api/endpoint/path": {
      "post": {
        "parameters":[
            {
                "name": "pathParam",
                "in": "path"
            },
            {
                "name": "queryParam",
                "in": "query"
            }
        ],
        "summary": "Api endpoint summary.",
        "description": "Api endpoint description.",
        "externalDocs": {
          "description": "Learn more about the SMS channel and its use cases",
          "url": "https://www.infobip.com/docs/sms"
        },
        "operationId": "send-sms-messages",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/*"
              }
            }
          }
        }
      }
    }
  }
}
```

## Infobip app Method Generation Script

Generate a script that reads the downloaded OpenAPI JSON file and generates methods for each API endpoint defined in the `paths` object.

Generate comprehensive JSDoc comments for each method, including:

- Summary from operation summary.
- Detailed description from operation description.
- Link to external documentation if available.
- Parameters including optional `data` object for request payload and required `infobip` string for authentication.
- Return type as a Promise.
- @param should be explained in detail to have clear understanding of what to pass in. OpenAPI spec details should be used to determine if parameters are required or optional.

All methods follow this standard pattern from the existing codebase:

```mjs
/**
 * Summary from operation summary.
 *
 * Detailed description from operation description.
 *
 * @see {@link externalDocs.url|External Documentation}
 *
 * @param {{
 *   data?: object, // Request body, if applicable
 *   pathParams?: [{
 *     name: string;
 *     value: string;
 *   }] // Example path parameter,
 *   pathQuery?: [{
 *     name: string;
 *     value: string;
 *   }] // Example query parameter,
 *   ...rest - Other optional parameters
 * },
 * }} [opts] - Optional parameters for the request.
 * @returns {Promise} - Promise resolving to the API response.
 */
methodName(opts = {}) {
    const { pathParams, pathQuery, ...rest } = opts;
    // Example of paths:
    // * /ct/1/log/end/{messageId}
    // * /sms/3/messages
    //* /whatsapp/{versionId}/message/template/{templateName}
    let path = `/api/{pathParam1}/path/{pathParam2}`;
    pathParams.forEach(({ name, value }) => {
        path = path.replace(`{${name}}`, value);
    });

    pathQuery?.forEach(({ name, value }) => {
        const separator = path.includes("?") ? "&" : "?";
        path += `${separator}${name}=${encodeURIComponent(value)}`;
    });

    return this._makeRequest({
        method: "POST",
        path,
        ...rest,
    });
}
```

- methodName: Use the `operationId` from the OpenAPI spec to derive the method name, converting it to camelCase if necessary. If `operationId` is not available, create a method name based on the summary.

- path: The API endpoint path from the OpenAPI spec (e.g., /sms/3/messages). Replace any path parameters (e.g., {pathParam}) with template literals.

- method: The HTTP method (GET, POST, PUT, DELETE, etc.) from the OpenAPI spec. Default to GET if not specified.

- param data: object - The request payload is optional and should be included if the OpenAPI spec path for that method defines a request body.

## Lint and Format

Ensure the generated code is properly linted and formatted according to the project's coding standards. Use tools like ESLint and Prettier if applicable.

Eslint file is located at project root: `eslint.config.mjs`.
