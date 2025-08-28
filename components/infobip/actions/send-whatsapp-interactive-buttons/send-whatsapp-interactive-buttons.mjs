import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-send-whatsapp-interactive-buttons",
  name: "Send WhatsApp Interactive Buttons Message",
  description: "Sends an interactive message with buttons via WhatsApp to a specified number. [See the documentation](https://www.infobip.com/docs/api#channels/whatsapp/send-whatsapp-interactive-buttons-message)",
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
    bodyText: {
      type: "string",
      label: "Body Text",
      description: "Main text content of the interactive message. Maximum 1024 characters.",
    },
    headerText: {
      type: "string",
      label: "Header Text",
      description: "Optional header text for the interactive message. Maximum 60 characters.",
      optional: true,
    },
    footerText: {
      type: "string",
      label: "Footer Text",
      description: "Optional footer text for the interactive message. Maximum 60 characters.",
      optional: true,
    },
    buttons: {
      type: "string",
      label: "Buttons",
      description: "JSON array of button objects. Each button should have 'type' (REPLY) and 'title' (max 20 chars). Maximum 3 buttons. Example: [{\"type\":\"REPLY\",\"id\":\"1\",\"title\":\"Yes\"},{\"type\":\"REPLY\",\"id\":\"2\",\"title\":\"No\"}]",
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
      bodyText,
      headerText,
      footerText,
      buttons,
      messageId,
    } = this;

    let parsedButtons;
    try {
      parsedButtons = JSON.parse(buttons);
    } catch (error) {
      throw new Error(`Invalid buttons JSON format: ${error.message}`);
    }

    if (!Array.isArray(parsedButtons) || parsedButtons.length === 0 || parsedButtons.length > 3) {
      throw new Error("Buttons must be an array with 1-3 button objects");
    }

    const content = {
      body: {
        text: bodyText,
      },
      action: {
        buttons: parsedButtons,
      },
    };

    if (headerText) {
      content.header = {
        type: "TEXT",
        text: headerText,
      };
    }

    if (footerText) {
      content.footer = {
        text: footerText,
      };
    }

    const response = await infobip.sendWhatsappInteractiveButtonsMessage({
      $,
      data: {
        from,
        to,
        messageId,
        content,
      },
    });

    $.export("$summary", `Successfully sent WhatsApp interactive buttons message to ${to}`);
    return response;
  },
};
