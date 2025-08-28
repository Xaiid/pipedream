import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-send-whatsapp-image-message",
  name: "Send WhatsApp Image Message",
  description: "Sends an image message via WhatsApp to a specified number. [See the documentation](https://www.infobip.com/docs/api#channels/whatsapp/send-whatsapp-image-message)",
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
      label: "Image URL",
      description: "URL of the image to be sent. Must be publicly accessible and a supported image format (JPEG, PNG, etc.).",
    },
    caption: {
      type: "string",
      label: "Caption",
      description: "Optional caption text to accompany the image.",
      optional: true,
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
      caption,
      messageId,
    } = this;

    const response = await infobip.sendWhatsappImageMessage({
      $,
      data: {
        from,
        to,
        messageId,
        content: {
          mediaUrl,
          ...(caption && {
            caption,
          }),
        },
      },
    });

    $.export("$summary", `Successfully sent WhatsApp image message to ${to}`);
    return response;
  },
};
