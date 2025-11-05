# Thesys Chat Widget for n8n

An embeddable chat widget that connects to your n8n workflows. Create beautiful chat interfaces powered by your custom n8n automations.

## Features

- 🎨 **Beautiful UI** - Clean, fullscreen chat interface
- 🚀 **Easy Integration** - Single script tag or npm package
- 💬 **Session Management** - Automatic session handling via C1Chat
- 🌓 **Theme Support** - Light and dark mode
- 📱 **Responsive** - Works perfectly on mobile and desktop
- 🖥️ **Fullscreen Mode** - Immersive chat experience

## Installation

### Option 1: CDN (Recommended for quick setup)

Add this script to your HTML:

```html
<script type="module">
  import { createChat } from 'https://cdn.jsdelivr.net/npm/thesys/n8n-chat/dist/chat.bundle.es.js';

  createChat({
    webhookUrl: 'YOUR_PRODUCTION_WEBHOOK_URL',
    agentName: 'Assistant'
  });
</script>
```

### Option 2: npm Package

```bash
npm install thesys/n8n-chat
```

```javascript
import { createChat } from 'thesys/n8n-chat';

const chat = createChat({
  webhookUrl: 'YOUR_PRODUCTION_WEBHOOK_URL'
});
```

## Usage

### Basic Setup

```html
<script type="module">
  import { createChat } from 'https://cdn.jsdelivr.net/npm/thesys/n8n-chat/dist/chat.bundle.es.js';

  const chat = createChat({
    webhookUrl: 'https://your-n8n-instance.com/webhook/xxx/chat',
    agentName: 'Support Bot',
    theme: { mode: 'light' }
  });
</script>
```

### Configuration Options

```typescript
interface ChatConfig {
  // Required: Your n8n webhook URL
  webhookUrl: string;

  // Optional: Callback when session starts
  // The sessionId is managed by C1Chat and passed as threadId
  onSessionStart?: (sessionId: string) => void;

  // Optional: Theme configuration
  theme?: {
    mode: 'light' | 'dark';
  };

  // Optional: Bot/agent name (default: "Assistant")
  agentName?: string;

  // Optional: Enable streaming responses (default: false)
  enableStreaming?: boolean;
}
```

### Programmatic Control

The `createChat` function returns a `ChatInstance` with these methods:

```javascript
const chat = createChat({ webhookUrl: '...' });

// Get current session ID
const sessionId = chat.getSessionId();

// Destroy the widget completely
chat.destroy();

// Note: open() and close() have no effect in fullscreen mode
```

### Advanced Example

```javascript
import { createChat } from 'thesys/n8n-chat';

const chat = createChat({
  webhookUrl: 'https://your-n8n-instance.com/webhook/xxx/chat',
  agentName: 'Sales Assistant',
  theme: { mode: 'dark' },
  enableStreaming: false,

  // Track when sessions start
  onSessionStart: (sessionId) => {
    console.log('Chat session started:', sessionId);
    // Send to analytics, etc.
  }
});
```

## n8n Workflow Setup

### 1. Create a Webhook Trigger

1. In n8n, create a new workflow
2. Add a **Webhook** node as the trigger
3. Set the webhook to accept POST requests
4. Configure the webhook path (e.g., `/webhook/xxx/chat`)

### 2. Process the Chat Input

The widget sends messages in this format:

```json
{
  "chatInput": "User's message here",
  "sessionId": "uuid-v4-session-id"
}
```

Access these in your workflow:
- `{{ $json.chatInput }}` - The user's message
- `{{ $json.sessionId }}` - The session ID for tracking conversations

### 3. Return a Response

**For non-streaming mode:**

Use the **Respond to Webhook** node to send a complete response:

```json
{
  "output": "Your bot's response here"
}
```

**For streaming mode (enableStreaming: true):**

Your n8n workflow should return line-delimited JSON chunks in this format:

```
{ "type": "item", "content": "First chunk " }
{ "type": "item", "content": "second chunk " }
{ "type": "item", "content": "final chunk" }
```

Each line is a separate JSON object. The widget will automatically combine these chunks and display them as they arrive.

### 4. Configure CORS (Important!)

In your Webhook node settings:

1. Enable **Domain Allowlist**
2. Add your domain(s): `example.com`, `www.example.com`
3. For local development, add: `localhost`, `127.0.0.1`

**Security Note:** Since the webhook is called directly from the browser, your webhook URL will be visible to users. Use n8n's Domain Allowlist feature to restrict access to your domain only.

## Example n8n Workflow

Here's a simple workflow structure:

```
Webhook (Trigger)
  ↓
[Process chatInput with AI/Logic]
  ↓
Respond to Webhook
```

Example nodes:
1. **Webhook** - Receives `chatInput` and `sessionId`
2. **OpenAI / HTTP Request / Function** - Process the message
3. **Respond to Webhook** - Return `{ "output": "response" }`

## Development

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 to see the test page

5. Update the `webhookUrl` in `index.html` with your n8n webhook URL

### Building for Production

```bash
npm run build
```

This creates:
- `dist/chat.bundle.es.js` - The widget bundle
- `dist/index.d.ts` - TypeScript definitions

### Testing the Build

```bash
npm run preview
```

This serves the built files locally so you can test the production bundle.

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Chat doesn't load

1. Check browser console for errors
2. Verify the webhook URL is correct
3. Ensure your n8n workflow is active
4. Check CORS/Domain Allowlist settings
5. Ensure the chat container has space (fullscreen mode)

### "Unable to reach the webhook" error

This usually means:
1. The webhook URL is incorrect
2. Your n8n instance is not accessible
3. CORS is not configured properly
4. Your domain is not in the Domain Allowlist

### Messages not sending

1. Check that your workflow returns a response using "Respond to Webhook"
2. Verify the response format: `{ "output": "message" }`
3. Check n8n execution logs for errors

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/thesysdev/n8n-thesys-chat/issues)
- Documentation: [View docs](https://github.com/thesysdev/n8n-thesys-chat)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
