import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-preview-sms",
  name: "Preview SMS",
  description: "Check how different message configurations will affect your message text, number of characters and message parts before sending. [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/outbound-sms/preview-sms-message)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    text: {
      propDefinition: [
        infobip,
        "text",
      ],
    },
    languageCode: {
      type: "string",
      label: "Language Code",
      description: "Language code for the correct character set.",
      options: [
        "TR",
        "ES",
        "PT",
        "AUTODETECT",
      ],
      optional: true,
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
  },
  async run({ $ }) {
    const {
      infobip,
      text,
      languageCode,
      transliteration,
    } = this;

    const response = await infobip.previewSms({
      $,
      data: {
        text,
        languageCode,
        transliteration,
      },
    });

    const preview = response.previews?.[0];
    const summary = preview
      ? `Preview: ${preview.messageCount} SMS parts, ${preview.charactersRemaining} characters remaining`
      : "SMS preview generated";

    $.export("$summary", summary);
    return response;
  },
};
