import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-confirm-sms-conversion",
  name: "Confirm SMS Conversion",
  description: "Inform Infobip platform about successful conversion for SMS performance monitoring. Used for tracking campaign effectiveness. [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/outbound-sms/confirm-conversion)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    messageId: {
      propDefinition: [
        infobip,
        "messageId",
      ],
      description: "ID of the converted message.",
    },
  },
  async run({ $ }) {
    const {
      infobip, messageId,
    } = this;

    const response = await infobip.confirmSmsConversion({
      $,
      messageId,
    });

    $.export("$summary", `Successfully confirmed conversion for message ID: ${messageId}`);
    return response;
  },
};
