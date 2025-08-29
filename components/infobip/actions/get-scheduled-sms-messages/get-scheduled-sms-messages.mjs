import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-get-scheduled-sms-messages",
  name: "Get Scheduled SMS Messages",
  description: "See all scheduled messages and their scheduled date and time. [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/outbound-sms/get-scheduled-sms-messages)",
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

    const response = await infobip.getScheduledSmsMessages({
      $,
      params: {
        bulkId,
      },
    });

    $.export("$summary", `Successfully retrieved scheduled SMS info for bulk ID: ${bulkId}`);
    return response;
  },
};
