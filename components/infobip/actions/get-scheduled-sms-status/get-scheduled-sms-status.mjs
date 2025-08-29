import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-get-scheduled-sms-status",
  name: "Get Scheduled SMS Status",
  description: "See the status of scheduled messages (PENDING, PAUSED, PROCESSING, CANCELED, FINISHED, FAILED). [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/outbound-sms/get-scheduled-sms-messages-status)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    bulkId: {
      type: "string",
      label: "Bulk ID",
      description: "The unique ID assigned to the scheduled message request.",
    },
  },
  async run({ $ }) {
    const {
      infobip, bulkId,
    } = this;

    const response = await infobip.getScheduledSmsStatus({
      $,
      params: {
        bulkId,
      },
    });

    $.export("$summary", `Scheduled SMS status for bulk ID ${bulkId}: ${response.status}`);
    return response;
  },
};
