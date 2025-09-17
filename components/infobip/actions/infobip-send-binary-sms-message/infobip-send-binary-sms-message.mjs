import infobip from "../../infobip-enhanced.app.mjs";

export default {
  key: "infobip-send-binary-sms-message",
  name: "Send Binary SMS Message",
  description:
    "Send binary SMS message Send single or multiple binary messages to one or more destination address. The API response will not contain the final delivery status, use [Delivery Reports](https://www.i... [See the documentation](https://www.infobip.com/docs/sms)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    applicationId: {
      propDefinition: [infobip, "applicationId"],
      optional: true,
    },
    entityId: {
      propDefinition: [infobip, "entityId"],
      optional: true,
    }
  },
  async run({ $ }) {
    const { infobip, applicationId, entityId, ...params } = this;

    const response = await infobip.sendBinarySmsMessage({
      $,
      data: {
        to: phoneNumber,
        text,
        ...(from && { from }),
        ...(applicationId && { applicationId }),
        ...(entityId && { entityId }),
        ...params,
      },
    });

    $.export(
      "$summary",
      `Message sent successfully: ${response.status?.description || "Success"}`
    );
    return response;
  },
};
