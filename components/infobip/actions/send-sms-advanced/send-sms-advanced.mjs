import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-send-sms-advanced",
  name: "Send SMS (Advanced)",
  description: "Send SMS messages using the latest v3 API with full feature support including scheduling, delivery tracking, URL shortening, and more. [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/outbound-sms/send-sms-messages)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    phoneNumber: {
      propDefinition: [
        infobip,
        "phoneNumber",
      ],
    },
    text: {
      propDefinition: [
        infobip,
        "text",
      ],
    },
    from: {
      propDefinition: [
        infobip,
        "from",
      ],
    },
    bulkId: {
      type: "string",
      label: "Bulk ID",
      description: "Unique ID assigned to the request. If not provided, it will be auto-generated.",
      optional: true,
    },
    messageId: {
      type: "string",
      label: "Message ID",
      description: "Unique message ID. If not provided, it will be auto-generated.",
      optional: true,
    },
    sendAt: {
      type: "string",
      label: "Send At",
      description: "Date and time when the message should be sent (ISO 8601 format). Leave empty to send immediately.",
      optional: true,
    },
    validityPeriod: {
      type: "integer",
      label: "Validity Period",
      description: "Message validity period in minutes (default: 2880 = 48 hours).",
      optional: true,
      default: 2880,
    },
    flash: {
      type: "boolean",
      label: "Flash SMS",
      description: "Send as flash SMS that appears immediately on screen.",
      optional: true,
      default: false,
    },
    transliteration: {
      type: "string",
      label: "Transliteration",
      description: "Convert message text from one script to another.",
      options: [
        "TURKISH",
        "GREEK",
        "CYRILLIC",
        "SERBIAN_CYRILLIC",
        "BULGARIAN_CYRILLIC",
        "CENTRAL_EUROPEAN",
        "BALTIC",
        "NON_UNICODE",
        "ALL",
      ],
      optional: true,
    },
    languageCode: {
      type: "string",
      label: "Language Code",
      description: "Language code for character set.",
      options: [
        "TR",
        "ES",
        "PT",
        "AUTODETECT",
      ],
      optional: true,
    },
    callbackData: {
      type: "string",
      label: "Callback Data",
      description: "Additional data included in delivery reports (max 4000 characters).",
      optional: true,
    },
    notifyUrl: {
      type: "string",
      label: "Delivery Report URL",
      description: "URL where delivery reports will be sent.",
      optional: true,
    },
    intermediateReport: {
      type: "boolean",
      label: "Intermediate Reports",
      description: "Enable real-time intermediate delivery reports.",
      optional: true,
      default: false,
    },
    shortenUrl: {
      type: "boolean",
      label: "Shorten URLs",
      description: "Automatically shorten URLs in the message.",
      optional: true,
      default: false,
    },
    trackClicks: {
      type: "boolean",
      label: "Track Clicks",
      description: "Track clicks on URLs in the message.",
      optional: true,
      default: false,
    },
    trackingUrl: {
      type: "string",
      label: "Click Tracking URL",
      description: "URL where click reports will be sent.",
      optional: true,
    },
    customDomain: {
      type: "string",
      label: "Custom Domain",
      description: "Custom domain for shortened URLs.",
      optional: true,
    },
    includeSmsCount: {
      type: "boolean",
      label: "Include SMS Count",
      description: "Include SMS count in response.",
      optional: true,
      default: false,
    },
    entityId: {
      propDefinition: [
        infobip,
        "entityId",
      ],
      optional: true,
    },
    applicationId: {
      propDefinition: [
        infobip,
        "applicationId",
      ],
      optional: true,
    },
    campaignReferenceId: {
      type: "string",
      label: "Campaign Reference ID",
      description: "ID for tracking campaign performance.",
      optional: true,
    },
  },
  methods: {
    buildMessageContent(text, transliteration, languageCode) {
      const content = {
        text,
      };

      if (transliteration) {
        content.transliteration = transliteration;
      }

      if (languageCode) {
        content.language = {
          languageCode,
        };
      }

      return content;
    },

    buildMessageOptions({
      validityPeriod, flash, callbackData, entityId, applicationId, campaignReferenceId,
    }) {
      const options = {};

      if (validityPeriod !== undefined) {
        options.validityPeriod = {
          amount: validityPeriod,
          timeUnit: "MINUTES",
        };
      }

      if (flash !== undefined) {
        options.flash = flash;
      }

      if (callbackData) {
        options.callbackData = callbackData;
      }

      if (entityId || applicationId) {
        options.platform = {};
        if (entityId) options.platform.entityId = entityId;
        if (applicationId) options.platform.applicationId = applicationId;
      }

      if (campaignReferenceId) {
        options.campaignReferenceId = campaignReferenceId;
      }

      return options;
    },

    buildWebhooks(notifyUrl, intermediateReport, callbackData) {
      if (!notifyUrl) return null;

      const webhooks = {
        delivery: {
          url: notifyUrl,
        },
        contentType: "application/json",
      };

      if (intermediateReport !== undefined) {
        webhooks.delivery.intermediateReport = intermediateReport;
      }

      if (callbackData) {
        webhooks.callbackData = callbackData;
      }

      return webhooks;
    },

    buildRequestOptions({
      sendAt, bulkId, shortenUrl, trackClicks, trackingUrl, customDomain, includeSmsCount,
    }) {
      const requestOptions = {};

      // Scheduling
      if (sendAt || bulkId) {
        requestOptions.schedule = {};
        if (sendAt) requestOptions.schedule.sendAt = sendAt;
        if (bulkId) requestOptions.schedule.bulkId = bulkId;
      }

      // URL tracking
      if (shortenUrl || trackClicks || trackingUrl || customDomain) {
        requestOptions.tracking = {};
        if (shortenUrl !== undefined) requestOptions.tracking.shortenUrl = shortenUrl;
        if (trackClicks !== undefined) requestOptions.tracking.trackClicks = trackClicks;
        if (trackingUrl) requestOptions.tracking.trackingUrl = trackingUrl;
        if (customDomain) requestOptions.tracking.customDomain = customDomain;
      }

      if (includeSmsCount !== undefined) {
        requestOptions.includeSmsCountInResponse = includeSmsCount;
      }

      return requestOptions;
    },
  },
  async run({ $ }) {
    const {
      infobip,
      phoneNumber,
      text,
      from,
      messageId,
      transliteration,
      languageCode,
      validityPeriod,
      flash,
      callbackData,
      entityId,
      applicationId,
      campaignReferenceId,
      notifyUrl,
      intermediateReport,
      sendAt,
      bulkId,
      shortenUrl,
      trackClicks,
      trackingUrl,
      customDomain,
      includeSmsCount,
    } = this;

    // Build the message object
    const messageData = {
      sender: from,
      destinations: [
        {
          to: phoneNumber,
        },
      ],
      content: this.buildMessageContent(text, transliteration, languageCode),
    };

    // Add message ID if provided
    if (messageId) {
      messageData.destinations[0].messageId = messageId;
    }

    // Build message options
    const options = this.buildMessageOptions({
      validityPeriod,
      flash,
      callbackData,
      entityId,
      applicationId,
      campaignReferenceId,
    });

    if (Object.keys(options).length > 0) {
      messageData.options = options;
    }

    // Build webhooks
    const webhooks = this.buildWebhooks(notifyUrl, intermediateReport, callbackData);
    if (webhooks) {
      messageData.webhooks = webhooks;
    }

    // Build request options
    const requestOptions = this.buildRequestOptions({
      sendAt,
      bulkId,
      shortenUrl,
      trackClicks,
      trackingUrl,
      customDomain,
      includeSmsCount,
    });

    const requestData = {
      messages: [
        messageData,
      ],
    };

    if (Object.keys(requestOptions).length > 0) {
      requestData.options = requestOptions;
    }

    const response = await infobip.sendSmsV3({
      $,
      data: requestData,
    });

    const message = response.messages?.[0];
    const status = message?.status?.name || "UNKNOWN";
    const destination = message?.destination || phoneNumber;

    let summary = `SMS sent to ${destination} with status: ${status}`;
    if (sendAt) {
      summary = `SMS scheduled for ${sendAt} to ${destination}`;
    }

    $.export("$summary", summary);
    return response;
  },
};
