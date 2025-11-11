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
   npm search thesysai/chat-client
   ```

2. **Publish to npm**:

   ```bash
   npm publish --access public
   ```

   Note: The `--access public` flag is required for scoped packages (@thesysai/chat-client)

3. **Verify the package**:
   - Visit: https://www.npmjs.com/package/thesysai/chat-client
   - Check files are correct

## Using via CDN

After publishing, the package will be automatically available on jsDelivr:

```html
<script type="module">
  import { createChat } from "https://cdn.jsdelivr.net/npm/thesysai/chat-client/dist/chat.bundle.es.js";

  createChat({
    webhookUrl: "YOUR_WEBHOOK_URL",
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
npm unpublish thesysai/chat-client@<version>
```

Note: Unpublishing is discouraged. Use `npm deprecate` instead:

```bash
npm deprecate thesysai/chat-client@<version> "reason for deprecation"
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
   npm install /path/to/thesysai-chat-client-0.1.0.tgz
   ```

4. **Verify it works** in the test project

5. **Clean up**:
   ```bash
   rm thesysai-chat-client-0.1.0.tgz
   ```

## Continuous Integration

Consider setting up GitHub Actions to automatically:

- Run tests on PR
- Build on merge to main
- Publish on release/tag

Example workflow location: `.github/workflows/publish.yml`
