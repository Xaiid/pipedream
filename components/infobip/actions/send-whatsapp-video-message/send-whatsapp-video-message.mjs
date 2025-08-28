import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-send-whatsapp-video-message",
  name: "Send WhatsApp Video Message",
  description: "Sends a video message via WhatsApp to a specified number. [See the documentation](https://www.infobip.com/docs/api#channels/whatsapp/send-whatsapp-video-message)",
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
      label: "Video URL",
      description: "URL of the video to be sent. Must be publicly accessible and a supported video format (MP4, 3GPP, MOV, AVI).",
    },
    caption: {
      type: "string",
      label: "Caption",
      description: "Optional caption text to accompany the video.",
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

    const response = await infobip.sendWhatsappVideoMessage({
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

    $.export("$summary", `Successfully sent WhatsApp video message to ${to}`);
    return response;
  },
};
