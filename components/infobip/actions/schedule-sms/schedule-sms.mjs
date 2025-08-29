import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-schedule-sms",
  name: "Schedule SMS",
  description: "Schedule an SMS message to be sent at a specific time. Can be scheduled up to 180 days in advance. [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/outbound-sms/send-sms-messages)",
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
    sendAt: {
      type: "string",
      label: "Send At",
      description: "Date and time when the message is to be sent (ISO 8601 format: yyyy-MM-dd'T'HH:mm:ss.SSSZ). Must be between 5 minutes and 180 days from now.",
    },
    bulkId: {
      type: "string",
      label: "Bulk ID",
      description: "Unique ID assigned to the request. If not provided, it will be auto-generated.",
      optional: true,
    },
    validityPeriod: {
      type: "integer",
      label: "Validity Period",
      description: "The message validity period in minutes (default: 2880 minutes = 48 hours). Maximum 48 hours.",
      optional: true,
      default: 2880,
      max: 2880,
    },
    flash: {
      type: "boolean",
      label: "Flash SMS",
      description: "Sends a flash SMS that will pop-up on the user's phone screen.",
      optional: true,
      default: false,
    },
    transliteration: {
      type: "string",
      label: "Transliteration",
      description: "Conversion of message text from one script to another.",
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
      description: "Code for language character set of message content.",
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
      description: "Additional data for identifying, managing, or monitoring the message (max 4000 characters).",
      optional: true,
    },
    notifyUrl: {
      type: "string",
      label: "Notify URL",
      description: "The URL on your callback server where delivery reports will be sent.",
      optional: true,
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
  },
  async run({ $ }) {
    const {
      infobip,
      phoneNumber,
      text,
      from,
      sendAt,
      bulkId,
      validityPeriod,
      flash,
      transliteration,
      languageCode,
      callbackData,
      notifyUrl,
      entityId,
      applicationId,
    } = this;

    const messageData = {
      sender: from,
      destinations: [
        {
          to: phoneNumber,
        },
      ],
      content: {
        text,
      },
      options: {
        schedule: {
          sendAt,
        },
      },
    };

    // Add bulk ID if provided
    if (bulkId) {
      messageData.options.schedule.bulkId = bulkId;
    }

    // Add optional content properties
    if (transliteration) {
      messageData.content.transliteration = transliteration;
    }

    if (languageCode) {
      messageData.content.language = {
        languageCode,
      };
    }

    // Add optional message properties
    if (validityPeriod !== undefined) {
      messageData.options.validityPeriod = {
        amount: validityPeriod,
        timeUnit: "MINUTES",
      };
    }

    if (flash !== undefined) {
      messageData.options.flash = flash;
    }

    if (callbackData) {
      messageData.options.callbackData = callbackData;
    }

    if (notifyUrl) {
      messageData.webhooks = {
        delivery: {
          url: notifyUrl,
        },
        contentType: "application/json",
      };
    }

    if (entityId) {
      messageData.options.platform = {
        ...(messageData.options.platform || {}),
        entityId,
      };
    }

    if (applicationId) {
      messageData.options.platform = {
        ...(messageData.options.platform || {}),
        applicationId,
      };
    }

    const response = await infobip.sendSmsV3({
      $,
      data: {
        messages: [
          messageData,
        ],
      },
    });

    $.export("$summary", `Successfully scheduled SMS to ${phoneNumber} for ${sendAt}`);
    return response;
  },
};
