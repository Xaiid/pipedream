import { axios } from "@pipedream/platform";
import { LIMIT } from "./common/constants.mjs";

export default {
  type: "app",
  app: "infobip",
  propDefinitions: {
    applicationId: {
      type: "string",
      label: "Application ID",
      description: "Required for application use in a send request for outbound traffic. Returned in notification events. For more details, [see the Infobip documentation](https://www.infobip.com/docs/cpaas-x/application-and-entity-management).",
      async options({ page }) {
        const { results } = await this.listApplications({
          params: {
            page: page,
            size: LIMIT,
          },
        });

        return results.map(({
          applicationId: value, applicationName: label,
        }) => ({
          label,
          value,
        }));
      },
    },
    entityId: {
      type: "string",
      label: "Entity Id",
      description: "Required for entity use in a send request for outbound traffic. Returned in notification events. For more details, [see the Infobip documentation](https://www.infobip.com/docs/cpaas-x/application-and-entity-management).",
      async options({ page }) {
        const { results } = await this.listEntities({
          params: {
            page: page,
            size: LIMIT,
          },
        });

        return results.map(({
          entityId: value, entityName: label,
        }) => ({
          label,
          value,
        }));
      },
    },
    resourceKey: {
      type: "string",
      label: "Resource Key",
      description: "Required if `Resource` not present.",
      async options({
        page, channel,
      }) {
        const { results } = await this.listResources({
          params: {
            page: page,
            size: LIMIT,
            channel,
          },
        });

        return results.map(({ resourceId }) => resourceId);
      },
    },
    phoneNumber: {
      type: "string",
      label: "Phone Number",
      description: "Message destination address. Addresses must be in international format (Example: 41793026727).",
    },
    text: {
      type: "string",
      label: "Text",
      description: "Content of the message being sent.",
    },
    from: {
      type: "string",
      label: "From",
      description: "The sender ID which can be alphanumeric or numeric (e.g., CompanyName). Make sure you don't exceed [character limit](https://www.infobip.com/docs/sms/get-started#sender-names).",
    },
    to: {
      type: "string",
      label: "To",
      description: "The destination address of the message.",
    },
    messageId: {
      type: "string",
      label: "Message ID",
      description: "The ID that uniquely identifies the message sent via WhatsApp.",
    },
    mediaUrl: {
      type: "string",
      label: "Media URL",
      description: "URL of the media file to be sent in the MMS. Must be publicly accessible.",
    },
    contentType: {
      type: "string",
      label: "Content Type",
      description: "MIME type of the media file (e.g., image/jpeg, image/png, video/mp4).",
      options: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "video/mp4",
        "video/3gpp",
        "audio/mpeg",
        "audio/wav",
      ],
    },
    subject: {
      type: "string",
      label: "Subject",
      description: "Subject line for the MMS message.",
    },
  },
  methods: {
    _baseUrl() {
      return (this.$auth.base_url.startsWith("https://"))
        ? this.$auth.base_url
        : `https://${this.$auth.base_url}`;
    },
    _headers() {
      return {
        "Authorization": `App ${this.$auth.api_key}`,
        "Content-type": "application/json",
      };
    },
    _makeRequest({
      $ = this, path, ...otherOpts
    }) {
      return axios($, {
        ...otherOpts,
        url: `${this._baseUrl()}${path}`,
        headers: this._headers(),
      });
    },
    listApplications(opts = {}) {
      return this._makeRequest({
        path: "/provisioning/1/applications",
        ...opts,
      });
    },
    listEntities(opts = {}) {
      return this._makeRequest({
        path: "/provisioning/1/entities",
        ...opts,
      });
    },
    listResources(opts = {}) {
      return this._makeRequest({
        path: "/provisioning/1/associations",
        ...opts,
      });
    },
    sendSms(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/sms/2/text/advanced",
        ...opts,
      });
    },
    sendSmsV3(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/sms/3/messages",
        ...opts,
      });
    },
    getSmsDeliveryReports(opts = {}) {
      return this._makeRequest({
        path: "/sms/3/reports",
        ...opts,
      });
    },
    getSmsLogs(opts = {}) {
      return this._makeRequest({
        path: "/sms/3/logs",
        ...opts,
      });
    },
    getScheduledSmsMessages(opts = {}) {
      return this._makeRequest({
        path: "/sms/1/bulks",
        ...opts,
      });
    },
    getScheduledSmsStatus(opts = {}) {
      return this._makeRequest({
        path: "/sms/1/bulks/status",
        ...opts,
      });
    },
    updateScheduledSmsStatus(opts = {}) {
      return this._makeRequest({
        method: "PUT",
        path: "/sms/1/bulks/status",
        ...opts,
      });
    },
    rescheduleScheduledSms(opts = {}) {
      return this._makeRequest({
        method: "PUT",
        path: "/sms/1/bulks",
        ...opts,
      });
    },
    previewSms(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/sms/1/preview",
        ...opts,
      });
    },
    getInboundSmsMessages(opts = {}) {
      return this._makeRequest({
        path: "/sms/1/inbox/reports",
        ...opts,
      });
    },
    confirmSmsConversion({
      messageId, ...opts
    }) {
      return this._makeRequest({
        method: "POST",
        path: `/ct/1/log/end/${messageId}`,
        ...opts,
      });
    },
    sendSmsQuery(opts = {}) {
      return this._makeRequest({
        path: "/sms/3/text/query",
        ...opts,
      });
    },
    sendViberMessage(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/viber/2/messages",
        ...opts,
      });
    },
    sendWhatsappMessage(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/whatsapp/1/message/text",
        ...opts,
      });
    },
    sendMms(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/mms/1/text",
        ...opts,
      });
    },
    sendWhatsappImageMessage(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/whatsapp/1/message/image",
        ...opts,
      });
    },
    sendWhatsappDocumentMessage(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/whatsapp/1/message/document",
        ...opts,
      });
    },
    sendWhatsappVideoMessage(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/whatsapp/1/message/video",
        ...opts,
      });
    },
    sendWhatsappAudioMessage(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/whatsapp/1/message/audio",
        ...opts,
      });
    },
    sendWhatsappTemplateMessage(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/whatsapp/1/message/template",
        ...opts,
      });
    },
    sendWhatsappInteractiveButtonsMessage(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/whatsapp/1/message/interactive/buttons",
        ...opts,
      });
    },
    sendWhatsappLocationMessage(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/whatsapp/1/message/location",
        ...opts,
      });
    },
    markWhatsappMessageAsRead({
      sender, messageId, ...opts
    }) {
      return this._makeRequest({
        method: "POST",
        path: `/whatsapp/1/senders/${sender}/message/${messageId}/read`,
        ...opts,
      });
    },
    createHook(opts = {}) {
      return this._makeRequest({
        method: "POST",
        path: "/resource-management/1/inbound-message-configurations",
        ...opts,
      });
    },
    deleteHook(webhookId) {
      return this._makeRequest({
        method: "DELETE",
        path: `/resource-management/1/inbound-message-configurations/${webhookId}`,
      });
    },
  },
};
