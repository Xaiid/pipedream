import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-send-whatsapp-location-message",
  name: "Send WhatsApp Location Message",
  description: "Sends a location message via WhatsApp to a specified number. [See the documentation](https://www.infobip.com/docs/api#channels/whatsapp/send-whatsapp-location-message)",
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
    latitude: {
      type: "string",
      label: "Latitude",
      description: "Latitude coordinate of the location (e.g., '40.7128').",
    },
    longitude: {
      type: "string",
      label: "Longitude",
      description: "Longitude coordinate of the location (e.g., '-74.0060').",
    },
    name: {
      type: "string",
      label: "Location Name",
      description: "Optional name of the location (e.g., 'New York City').",
      optional: true,
    },
    address: {
      type: "string",
      label: "Address",
      description: "Optional address of the location (e.g., 'New York, NY, USA').",
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
      latitude,
      longitude,
      name,
      address,
      messageId,
    } = this;

    const content = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    if (name) {
      content.name = name;
    }

    if (address) {
      content.address = address;
    }

    const response = await infobip.sendWhatsappLocationMessage({
      $,
      data: {
        from,
        to,
        messageId,
        content,
      },
    });

    $.export("$summary", `Successfully sent WhatsApp location message to ${to}`);
    return response;
  },
};
