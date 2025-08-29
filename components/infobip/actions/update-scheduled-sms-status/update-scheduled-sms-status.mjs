import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-update-scheduled-sms-status",
  name: "Update Scheduled SMS Status",
  description: "Change the status or completely cancel sending of scheduled messages. [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/outbound-sms/update-scheduled-sms-messages-status)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    bulkId: {
      type: "string",
      label: "Bulk ID",
      description: "The unique ID assigned to the scheduled message request.",
    },
    status: {
      type: "string",
      label: "Status",
      description: "The new status for the scheduled messages.",
      options: [
        "PENDING",
        "PAUSED",
        "PROCESSING",
        "CANCELED",
        "FINISHED",
        "FAILED",
      ],
    },
  },
  async run({ $ }) {
    const {
      infobip, bulkId, status,
    } = this;

    const response = await infobip.updateScheduledSmsStatus({
      $,
      params: {
        bulkId,
      },
      data: {
        status,
      },
    });

    $.export("$summary", `Successfully updated scheduled SMS status to ${status} for bulk ID: ${bulkId}`);
    return response;
  },
};
