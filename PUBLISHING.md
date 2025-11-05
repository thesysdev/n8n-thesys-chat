# Publishing Guide

## Pre-Publishing Checklist

1. **Update version** in `package.json`
2. **Test the build**:

   ```bash
   npm run build
   ```

3. **Test locally with preview**:
   ```bash
   npm run preview
   ```

## Publishing to npm

### First-time Setup

1. Create an npm account at https://www.npmjs.com/signup
2. Login to npm:

   ```bash
   npm login
   ```

3. Verify your login:
   ```bash
   npm whoami
   ```

### Publishing

1. **Make sure package name is available** (or update in package.json):

   ```bash
   npm search thesys/n8n-chat
   ```

2. **Publish to npm**:

   ```bash
   npm publish --access public
   ```

   Note: The `--access public` flag is required for scoped packages (@thesys/n8n-chat)

3. **Verify the package**:
   - Visit: https://www.npmjs.com/package/thesys/n8n-chat
   - Check files are correct

## Using via CDN

After publishing, the package will be automatically available on jsDelivr:

```html
<script type="module">
  import { createChat } from "https://cdn.jsdelivr.net/npm/thesys/n8n-chat/dist/chat.bundle.es.js";

  createChat({
    webhookUrl: "YOUR_N8N_WEBHOOK_URL",
  });
</script>
```

## Version Management

Follow semantic versioning:

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backwards compatible
- **Patch** (0.0.1): Bug fixes

Update version:

```bash
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.1 -> 0.2.0
npm version major  # 0.2.0 -> 1.0.0
```

Then publish:

```bash
npm publish --access public
```

## Unpublishing (Emergency Only)

You can unpublish within 72 hours of publishing:

```bash
npm unpublish thesys/n8n-chat@<version>
```

Note: Unpublishing is discouraged. Use `npm deprecate` instead:

```bash
npm deprecate thesys/n8n-chat@<version> "reason for deprecation"
```

## Testing Before Publishing

1. **Build the package**:

   ```bash
   npm run build
   ```

2. **Pack it locally** (creates a tarball):

   ```bash
   npm pack
   ```

3. **Test installation** in another project:

   ```bash
   npm install /path/to/thesys-n8n-chat-0.1.0.tgz
   ```

4. **Verify it works** in the test project

5. **Clean up**:
   ```bash
   rm thesys-n8n-chat-0.1.0.tgz
   ```

## Continuous Integration

Consider setting up GitHub Actions to automatically:

- Run tests on PR
- Build on merge to main
- Publish on release/tag

Example workflow location: `.github/workflows/publish.yml`
