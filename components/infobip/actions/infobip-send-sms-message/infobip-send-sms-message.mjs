import infobip from "../../infobip-enhanced.app.mjs";

export default {
  key: "infobip-send-sms-message",
  name: "Send SMS Message V2",
  description:
    "Send SMS message Use this endpoint to send an SMS and set up a rich set of features, such as batch sending with a single API request, scheduling, URL tracking, language and transliteration configur... [See the documentation](https://www.infobip.com/docs/sms)",
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

    const response = await infobip.sendSmsMessage({
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
