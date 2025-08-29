import infobip from "../../infobip.app.mjs";

export default {
  key: "infobip-get-sms-logs",
  name: "Get SMS Logs",
  description: "Retrieve logs of sent SMS messages with delivery information. Available for the last 48 hours with a maximum of 1000 logs per call. [See the documentation](https://www.infobip.com/docs/api/channels/sms/sms-messaging/logs-and-status-reports/get-outbound-sms-message-logs-v3)",
  version: "0.0.1",
  type: "action",
  props: {
    infobip,
    from: {
      propDefinition: [
        infobip,
        "from",
      ],
      optional: true,
    },
    to: {
      propDefinition: [
        infobip,
        "to",
      ],
      optional: true,
    },
    bulkId: {
      type: "string",
      label: "Bulk ID",
      description: "Unique ID assigned to the request if messaging multiple recipients. May contain multiple comma-separated values.",
      optional: true,
    },
    messageId: {
      type: "string",
      label: "Message ID",
      description: "Unique message ID for which a log is requested. May contain multiple comma-separated values.",
      optional: true,
    },
    generalStatus: {
      type: "string",
      label: "General Status",
      description: "Sent message status.",
      options: [
        "ACCEPTED",
        "PENDING",
        "UNDELIVERABLE",
        "DELIVERED",
        "EXPIRED",
        "REJECTED",
      ],
      optional: true,
    },
    sentSince: {
      type: "string",
      label: "Sent Since",
      description: "The logs will only include messages sent after this date (ISO 8601 format: yyyy-MM-dd'T'HH:mm:ss.SSSZ).",
      optional: true,
    },
    sentUntil: {
      type: "string",
      label: "Sent Until",
      description: "The logs will only include messages sent before this date (ISO 8601 format: yyyy-MM-dd'T'HH:mm:ss.SSSZ).",
      optional: true,
    },
    limit: {
      type: "integer",
      label: "Limit",
      description: "Maximum number of messages to include in logs (default: 50, max: 1000).",
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
      description: "ID of a campaign that was sent in the message. May contain multiple comma-separated values.",
      optional: true,
    },
    mcc: {
      type: "string",
      label: "Mobile Country Code",
      description: "Mobile Country Code.",
      optional: true,
    },
    mnc: {
      type: "string",
      label: "Mobile Network Code",
      description: "Mobile Network Code. Mobile Country Code is required if this property is used.",
      optional: true,
    },
  },
  async run({ $ }) {
    const {
      infobip,
      from,
      to,
      bulkId,
      messageId,
      generalStatus,
      sentSince,
      sentUntil,
      limit,
      entityId,
      applicationId,
      campaignReferenceId,
      mcc,
      mnc,
    } = this;

    const response = await infobip.getSmsLogs({
      $,
      params: {
        from,
        to,
        bulkId,
        messageId,
        generalStatus,
        sentSince,
        sentUntil,
        limit,
        entityId,
        applicationId,
        campaignReferenceId,
        mcc,
        mnc,
      },
    });

    $.export("$summary", `Successfully retrieved ${response.results?.length || 0} SMS logs`);
    return response;
  },
};
