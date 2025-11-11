# Thesys Chat Client

An embeddable chat widget that connects to webhook endpoints. Create beautiful chat interfaces powered by your custom workflows from n8n, Make.com, or any custom webhook provider.

## Features

- 🎨 **Beautiful UI** - Clean, fullscreen chat interface
- 🚀 **Easy Integration** - Single script tag or npm package
- 💬 **Session Management** - Automatic session handling
- 💾 **Persistence** - Optional localStorage support for chat history
- 🗂️ **Thread Management** - Create, switch, and delete conversation threads
- 🌓 **Theme Support** - Light and dark mode
- 📱 **Responsive** - Works perfectly on mobile and desktop
- 🔌 **Provider Agnostic** - Works with n8n, Make.com, or custom webhooks

## Quick Start

Add this script to your HTML:

```html
<script type="module">
  import { createChat } from 'https://cdn.jsdelivr.net/npm/thesysai/chat-client/dist/chat.bundle.es.js';

  createChat({
    n8n: {
      webhookUrl: 'YOUR_WEBHOOK_URL'
    },
    agentName: 'Assistant'
  });
</script>
```

## Installation

### CDN (Recommended)

See Quick Start above.

### npm Package

```bash
npm install thesysai/chat-client
```

```javascript
import { createChat } from 'thesysai/chat-client';

const chat = createChat({
  n8n: {
    webhookUrl: 'YOUR_WEBHOOK_URL'
  }
});
```

## Configuration

```javascript
const chat = createChat({
  // Required: Webhook configuration
  n8n: {
    webhookUrl: 'https://your-webhook-endpoint.com/chat',
    enableStreaming: false  // Optional: Enable streaming responses
  },

  // Optional settings
  agentName: 'Assistant',           // Bot/agent name
  theme: { mode: 'light' },         // 'light' or 'dark'
  storageType: 'localstorage',      // 'none' or 'localstorage'
  mode: 'fullscreen',               // 'fullscreen' or 'sidepanel'

  // Optional: Callback when session starts
  onSessionStart: (sessionId) => {
    console.log('Session started:', sessionId);
  }
});
```

### Storage Options

**`storageType: "none"` (default):**
- Messages work normally during the session
- All data is lost on page refresh

**`storageType: "localstorage"`:**
- Chat conversations persist across page refreshes
- Users can create and manage multiple threads
- Thread history is saved to browser localStorage

### Programmatic Control

```javascript
// Get current session ID
const sessionId = chat.getSessionId();

// Destroy the widget completely
chat.destroy();
```

## Webhook Integration

### Request Format

The chat client sends POST requests to your webhook:

```json
{
  "chatInput": "User's message here",
  "sessionId": "uuid-v4-session-id"
}
```

### Response Format

**Non-streaming mode:**

```json
{
  "output": "Your bot's response here"
}
```

**Streaming mode (`enableStreaming: true`):**

Return line-delimited JSON chunks:

```
{ "type": "item", "content": "First chunk " }
{ "type": "item", "content": "second chunk " }
{ "type": "item", "content": "final chunk" }
```

## Provider Setup

### n8n

1. **Create a Webhook Trigger**
   - Add a Webhook node to your workflow
   - Set it to accept POST requests
   - Note your webhook URL

2. **Access the Data**
   - Message: `{{ $json.chatInput }}`
   - Session ID: `{{ $json.sessionId }}`

3. **Return a Response**
   - Use "Respond to Webhook" node
   - Return: `{ "output": "Your response" }`

4. **Configure CORS**
   - Enable Domain Allowlist in webhook settings
   - Add your domain(s): `example.com`, `www.example.com`
   - For local dev: `localhost`, `127.0.0.1`

**Security Note:** The webhook URL is visible in the browser. Use n8n's Domain Allowlist to restrict access.

### Make.com

1. Create a scenario with a **Webhook** module
2. Process `chatInput` and `sessionId`
3. Add your logic (AI, database, etc.)
4. Use **Webhook Response** to return `{ "output": "Your response" }`

### Custom Webhook

Your endpoint should:
1. Accept POST requests with JSON body
2. Parse `chatInput` and `sessionId`
3. Return JSON: `{ "output": "Your response" }`

For streaming, return line-delimited JSON chunks.

## Configuration Reference

Complete list of all available options:

### n8n (required)

```typescript
n8n: {
  // Required: Your webhook URL
  webhookUrl: string;

  // Optional: Enable streaming responses (default: false)
  enableStreaming?: boolean;

  // Optional: Custom webhook configuration
  webhookConfig?: {
    method?: string;                    // HTTP method (default: "POST")
    headers?: Record<string, string>;   // Custom headers
  };
}
```

### agentName (optional)

```typescript
agentName?: string;  // Default: "Assistant"
```

The name displayed for the bot/agent in the chat interface.

### theme (optional)

```typescript
theme?: {
  mode: 'light' | 'dark';  // Default: 'light'
}
```

Sets the color scheme for the chat interface.

### storageType (optional)

```typescript
storageType?: 'none' | 'localstorage';  // Default: 'none'
```

Controls chat history persistence:
- `'none'` - Messages are kept in memory only, lost on page refresh
- `'localstorage'` - Messages are saved to browser localStorage, persist across sessions

### mode (optional)

```typescript
mode?: 'fullscreen' | 'sidepanel';  // Default: 'fullscreen'
```

Controls the display mode:
- `'fullscreen'` - Takes up the entire viewport
- `'sidepanel'` - Displays as a side panel (widget style)

### onSessionStart (optional)

```typescript
onSessionStart?: (sessionId: string) => void;
```

Callback function that fires when a new chat session is created. Receives the session ID as a parameter. Useful for analytics or tracking.

## Troubleshooting

### Chat doesn't load
- Check browser console for errors
- Verify webhook URL is correct
- Ensure webhook endpoint is active and accessible
- Check CORS settings

### "Unable to reach the webhook" error
- Verify webhook URL is correct
- Check CORS configuration
- Ensure your domain is allowlisted (for n8n)

### Messages not sending
- Verify response format: `{ "output": "message" }`
- Check webhook execution logs

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Support

- GitHub Issues: [Create an issue](https://github.com/thesysai/chat-client/issues)
- Documentation: [View docs](https://github.com/thesysai/chat-client)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
