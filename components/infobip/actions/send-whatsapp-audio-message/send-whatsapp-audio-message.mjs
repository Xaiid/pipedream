import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-send-whatsapp-audio-message",
  name: "Send WhatsApp Audio Message",
  description: "Sends an audio message via WhatsApp to a specified number. [See the documentation](https://www.infobip.com/docs/api#channels/whatsapp/send-whatsapp-audio-message)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    from: {
      propDefinition: [
        infobip,
        "from",
      ],
      description: "Registered WhatsApp sender number. Must be in international format and comply with [WhatsApp's requirements](https://www.infobip.com/docs/whatsapp/get-started#phone-number-what-you-need-to-know).",
    },
    to: {
      propDefinition: [
        infobip,
        "phoneNumber",
      ],
      description: "Message recipient number. Must be in international format.",
    },
    mediaUrl: {
      type: "string",
      label: "Audio URL",
      description: "URL of the audio file to be sent. Must be publicly accessible and a supported audio format (AAC, M4A, AMR, MP3, OGG).",
    },
    messageId: {
      propDefinition: [
        infobip,
        "messageId",
      ],
      optional: true,
    },
  },
  async run({ $ }) {
    const {
      infobip,
      from,
      to,
      mediaUrl,
      messageId,
    } = this;

    const response = await infobip.sendWhatsappAudioMessage({
      $,
      data: {
        from,
        to,
        messageId,
        content: {
          mediaUrl,
        },
      },
    });

    $.export("$summary", `Successfully sent WhatsApp audio message to ${to}`);
    return response;
  },
};
