import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-send-whatsapp-template-message",
  name: "Send WhatsApp Template Message",
  description: "Sends a pre-approved template message via WhatsApp to a specified number. Template messages can be sent outside the 24-hour window. [See the documentation](https://www.infobip.com/docs/api#channels/whatsapp/send-whatsapp-template-message)",
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
    templateName: {
      type: "string",
      label: "Template Name",
      description: "Name of the approved WhatsApp template to use.",
    },
    templateLanguage: {
      type: "string",
      label: "Template Language",
      description: "Language code of the template (e.g., 'en', 'es', 'pt_BR').",
      default: "en",
    },
    templateData: {
      type: "string[]",
      label: "Template Parameters",
      description: "Array of parameter values to replace placeholders in the template. Order must match template parameter order.",
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
      templateName,
      templateLanguage,
      templateData,
      messageId,
    } = this;

    const content = {
      templateName,
      templateData: templateData || [],
      language: templateLanguage,
    };

    const response = await infobip.sendWhatsappTemplateMessage({
      $,
      data: {
        from,
        to,
        messageId,
        content,
      },
    });

    $.export("$summary", `Successfully sent WhatsApp template message "${templateName}" to ${to}`);
    return response;
  },
};
