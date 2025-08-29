import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-send-sms-query",
  name: "Send SMS via Query Parameters",
  description: "Send SMS using query parameters method. Use only if the regular send SMS is not suitable for your use case. [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/outbound-sms/send-sms-messages-over-query-parameters)",
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
      description: "Unique ID assigned to the request.",
      optional: true,
    },
    flash: {
      type: "boolean",
      label: "Flash SMS",
      description: "Send as flash SMS.",
      optional: true,
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
    validityPeriod: {
      type: "integer",
      label: "Validity Period",
      description: "Message validity period in minutes.",
      optional: true,
    },
    sendAt: {
      type: "string",
      label: "Send At",
      description: "Date and time when message should be sent (ISO 8601 format).",
      optional: true,
    },
    notifyUrl: {
      type: "string",
      label: "Notify URL",
      description: "URL for delivery reports.",
      optional: true,
    },
    callbackData: {
      type: "string",
      label: "Callback Data",
      description: "Additional data for delivery reports.",
      optional: true,
    },
  },
  async run({ $ }) {
    const {
      infobip,
      phoneNumber,
      text,
      from,
      bulkId,
      flash,
      transliteration,
      languageCode,
      validityPeriod,
      sendAt,
      notifyUrl,
      callbackData,
    } = this;

    const response = await infobip.sendSmsQuery({
      $,
      params: {
        to: phoneNumber,
        text,
        from,
        bulkId,
        flash,
        transliteration,
        languageCode,
        validityPeriod,
        sendAt,
        notifyUrl,
        callbackData,
        notifyContentType: "application/json",
      },
    });

    $.export("$summary", `SMS sent via query to ${phoneNumber}`);
    return response;
  },
};
