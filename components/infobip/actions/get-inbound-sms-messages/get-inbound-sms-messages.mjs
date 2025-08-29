import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-get-inbound-sms-messages",
  name: "Get Inbound SMS Messages",
  description: "Fetch received SMS messages if you're unable to receive them in real-time via webhook. Each request returns a batch of received messages only once. [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/inbound-sms/get-inbound-sms-messages)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    limit: {
      type: "integer",
      label: "Limit",
      description: "Maximum number of messages to return. If not set, the latest 50 records are returned (max: 1000). Messages are available for last 48h only.",
      optional: true,
      default: 50,
      min: 1,
      max: 1000,
    },
    applicationId: {
      propDefinition: [
        infobip,
        "applicationId",
      ],
      optional: true,
    },
    entityId: {
      propDefinition: [
        infobip,
        "entityId",
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
      limit,
      applicationId,
      entityId,
      campaignReferenceId,
    } = this;

    const response = await infobip.getInboundSmsMessages({
      $,
      params: {
        limit,
        applicationId,
        entityId,
        campaignReferenceId,
      },
    });

    const messageCount = response.results?.length || 0;
    const pendingCount = response.pendingMessageCount || 0;

    $.export("$summary", `Retrieved ${messageCount} inbound SMS messages (${pendingCount} pending)`);
    return response;
  },
};
