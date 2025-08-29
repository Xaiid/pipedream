import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-get-sms-delivery-reports",
  name: "Get SMS Delivery Reports",
  description: "Retrieve delivery reports for sent SMS messages. Use this to confirm whether specific messages have been delivered. [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/logs-and-status-reports/get-outbound-sms-message-delivery-reports-v3)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    bulkId: {
      type: "string",
      label: "Bulk ID",
      description: "The ID that uniquely identifies the request for delivery reports.",
      optional: true,
    },
    messageId: {
      propDefinition: [
        infobip,
        "messageId",
      ],
      optional: true,
    },
    limit: {
      type: "integer",
      label: "Limit",
      description: "Maximum number of delivery reports to return (default: 50, max: 1000).",
      optional: true,
      default: 50,
      min: 1,
      max: 1000,
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
    campaignReferenceId: {
      type: "string",
      label: "Campaign Reference ID",
      description: "ID of a campaign that was sent in the message.",
      optional: true,
    },
  },
  async run({ $ }) {
    const {
      infobip,
      bulkId,
      messageId,
      limit,
      entityId,
      applicationId,
      campaignReferenceId,
    } = this;

    const response = await infobip.getSmsDeliveryReports({
      $,
      params: {
        bulkId,
        messageId,
        limit,
        entityId,
        applicationId,
        campaignReferenceId,
      },
    });

    $.export("$summary", `Successfully retrieved ${response.results?.length || 0} delivery reports`);
    return response;
  },
};
