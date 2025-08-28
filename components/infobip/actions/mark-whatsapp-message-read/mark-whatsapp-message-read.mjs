import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-mark-whatsapp-message-read",
  name: "Mark WhatsApp Message as Read",
  description: "Marks a WhatsApp message as read for the specified sender. [See the documentation](https://www.infobip.com/docs/api#channels/whatsapp/mark-whatsapp-message-as-read)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    sender: {
      propDefinition: [
        infobip,
        "from",
      ],
      label: "Sender",
      description: "Registered WhatsApp sender number that received the message. Must be in international format.",
    },
    messageId: {
      propDefinition: [
        infobip,
        "messageId",
      ],
      description: "The ID of the message to mark as read.",
    },
  },
  async run({ $ }) {
    const {
      infobip,
      sender,
      messageId,
    } = this;

    const response = await infobip.markWhatsappMessageAsRead({
      $,
      sender,
      messageId,
    });

    $.export("$summary", `Successfully marked WhatsApp message ${messageId} as read`);
    return response;
  },
};
