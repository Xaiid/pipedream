// Test file for MMS action
import sendMms from "./send-mms.mjs";

// Mock Pipedream context
const mockContext = {
  export: (key, value) => console.log(`${key}: ${value}`),
};

// Mock Infobip app
const mockInfobip = {
  sendMms: async ({ data }) => {
    console.log("Mock MMS API call:", JSON.stringify(data, null, 2));
    return {
      messages: [{
        status: {
          description: "Message sent successfully (mock)",
        },
      }],
    };
  },
};

// Test the action
async function testMmsAction() {
  const action = {
    ...sendMms,
    infobip: mockInfobip,
    from: "TestSender",
    to: "+1234567890", 
    text: "Test MMS message",
    subject: "Test Subject",
    mediaUrl: "https://example.com/test.jpg",
    contentType: "image/jpeg",
  };

  try {
    const result = await action.run({ $: mockContext });
    console.log("Test Result:", result);
  } catch (error) {
    console.error("Test Error:", error);
  }
}

testMmsAction();