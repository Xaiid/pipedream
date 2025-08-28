import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-send-mms",
  name: "Send MMS",
  description: "Sends an MMS (Multimedia Messaging Service) message to a specified number. [See the documentation](https://www.infobip.com/docs/api#channels/mms/send-mms-message)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    from: {
      propDefinition: [
        infobip,
        "from",
      ],
      description: "The sender ID which can be alphanumeric or numeric (e.g., CompanyName). Must be MMS-enabled.",
    },
    to: {
      propDefinition: [
        infobip,
        "phoneNumber",
      ],
      description: "Message destination address. Must be in international format (Example: 41793026727).",
    },
    text: {
      propDefinition: [
        infobip,
        "text",
      ],
      optional: true,
      description: "Text content of the MMS message (optional if media is provided).",
    },
    subject: {
      propDefinition: [
        infobip,
        "subject",
      ],
      optional: true,
    },
    mediaUrl: {
      propDefinition: [
        infobip,
        "mediaUrl",
      ],
      optional: true,
    },
    contentType: {
      propDefinition: [
        infobip,
        "contentType",
      ],
      optional: true,
    },
    notifyUrl: {
      type: "string",
      label: "Notify URL",
      description: "The URL on your callback server to which a delivery report will be sent.",
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
    validityPeriod: {
      type: "integer",
      label: "Validity Period",
      description: "The message validity period in minutes. How long the delivery will be attempted.",
      optional: true,
      min: 5,
      max: 2880,
    },
    deliveryTimeWindow: {
      type: "object",
      label: "Delivery Time Window",
      description: "Sets specific delivery window for the message.",
      optional: true,
    },
  },
  async run({ $ }) {
    const {
      infobip,
      to,
      from,
      text,
      subject,
      mediaUrl,
      contentType,
      notifyUrl,
      entityId,
      applicationId,
      validityPeriod,
      deliveryTimeWindow,
    } = this;

    // Build the message payload
    const messageData = {
      from,
      destinations: [
        {
          to,
        },
      ],
    };

    // Add text content if provided
    if (text) {
      messageData.text = text;
    }

    // Add subject if provided
    if (subject) {
      messageData.subject = subject;
    }

    // Add media content if provided
    if (mediaUrl && contentType) {
      messageData.content = {
        mediaUrl,
        contentType,
      };
    }

    // Add optional parameters
    if (notifyUrl) messageData.notifyUrl = notifyUrl;
    if (entityId) messageData.entityId = entityId;
    if (applicationId) messageData.applicationId = applicationId;
    if (validityPeriod) messageData.validityPeriod = validityPeriod;
    if (deliveryTimeWindow) messageData.deliveryTimeWindow = deliveryTimeWindow;

    const response = await infobip.sendMms({
      $,
      data: {
        messages: [messageData],
      },
    });

    const message = response.messages?.[0];
    const summary = message?.status?.description || "MMS sent successfully";
    
    $.export("$summary", summary);
    return response;
  },
};