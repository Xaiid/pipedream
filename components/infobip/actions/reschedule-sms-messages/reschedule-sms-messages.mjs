import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-reschedule-sms-messages",
  name: "Reschedule SMS Messages",
  description: "Change the date and time of already scheduled messages. [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/outbound-sms/reschedule-sms-messages)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    bulkId: {
      type: "string",
      label: "Bulk ID",
      description: "The unique ID assigned to the scheduled message request.",
    },
    sendAt: {
      type: "string",
      label: "New Send At",
      description: "New date and time when the message is to be sent (ISO 8601 format: yyyy-MM-dd'T'HH:mm:ss.SSSZ). Must be between 5 minutes and 180 days from now.",
    },
  },
  async run({ $ }) {
    const {
      infobip, bulkId, sendAt,
    } = this;

    const response = await infobip.rescheduleScheduledSms({
      $,
      params: {
        bulkId,
      },
      data: {
        sendAt,
      },
    });

    $.export("$summary", `Successfully rescheduled SMS messages for bulk ID: ${bulkId} to ${sendAt}`);
    return response;
  },
};
