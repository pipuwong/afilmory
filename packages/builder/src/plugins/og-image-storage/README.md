# OG Image Storage Plugin

This plugin renders Open Graph (OG) images for each processed photo and uploads them to remote storage.

## Examples

### Plugin usage
```ts
import { defineBuilderConfig, thumbnailStoragePlugin, ogImagePlugin } from '@afilmory/builder'

export default defineBuilderConfig(() => ({
    storage: {
        provider: 's3',
        bucket: process.env.S3_BUCKET_NAME!,
        region: process.env.S3_REGION!,
        endpoint: process.env.S3_ENDPOINT, // Optional, defaults to AWS S3
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        prefix: process.env.S3_PREFIX || 'photos/',
        customDomain: process.env.S3_CUSTOM_DOMAIN, // Optional CDN domain
        excludeRegex: process.env.S3_EXCLUDE_REGEX,
        downloadConcurrency: 16, // Adjust based on network
    },
	plugins: [
		thumbnailStoragePlugin(),
		ogImagePlugin({
			siteName: "YOUR_SITE_NAME",
			accentColor: '#fb7185',
		}),
	],
}))
```

### Example Cloudflare Pages Middleware

If you are using Cloudflare Pages to host your Afilmory, you can use the following minimal middleware to rewrite the OG image meta tags on photo pages to point to the generated OG images stored in your storage.
You only need to change the `SITE_ORIGIN` and `OG_PATH` constants to match your site, and put the file in your `functions/_middleware.js` path.

```js
// Minimal middleware to rewrite OG image meta tags for photo pages on Cloudflare Pages.
// Assumes OG images are stored at https://your.afilmory.site/.afilmory/og-images/{slug}.png

const SITE_ORIGIN = 'https://your.afilmory.site'
const OG_PATH = '/.afilmory/og-images'
const OG_PATTERN = /^https?:\/\/your\.afilmory\.site\/+og-image.*\.png$/i

const normalizeSlug = (slug) => {
    try {
        return encodeURIComponent(decodeURIComponent(slug))
    } catch {
        return encodeURIComponent(slug)
    }
}

const buildOgUrl = (slug) => `${SITE_ORIGIN}${OG_PATH}/${normalizeSlug(slug)}.png`
const stripPhotosPrefix = (pathname) => pathname.replace(/^\/?photos\//, '').replace(/\/$/, '')
const isHtml = (response) => (response.headers.get('content-type') || '').includes('text/html')
const shouldRewrite = (content) => Boolean(content?.trim() && OG_PATTERN.test(content.trim()))

export const onRequest = async ({ request, next }) => {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/photos/')) return next()

    const slug = stripPhotosPrefix(url.pathname)
    if (!slug) return next()

    const response = await next()
    if (!isHtml(response)) return response

    const ogUrl = buildOgUrl(slug)
    const handler = {
        element(element) {
            const content = element.getAttribute('content')
            if (shouldRewrite(content)) element.setAttribute('content', ogUrl)
        },
    }

    return new HTMLRewriter()
        .on('meta[property="og:image"]', handler)
        .on('meta[property="twitter:image"]', handler)
        .transform(response)
}
```


## How it works
- Hooks into the builder after each photo is processed.
- Loads site branding from `config.json` (or provided path) and falls back to simple defaults.
- Reuses the generated thumbnail (buffer or URL) as the image source, avoiding extra reads of the original file.
- Injects light EXIF/context (title, date, focal length, aperture, ISO, shutter speed, camera) into the card.
- Renders the card with `@afilmory/og-renderer` (Satori + resvg) using bundled fonts, then uploads the PNG to storage.
- Caches uploads and public URLs within a single run so repeated work is skipped.

## Configuration
- `enable` (boolean): turn the plugin on/off. Defaults to `true`.
- `directory` (string): remote path prefix. Defaults to `.afilmory/og-images`.
- `storageConfig` (storage config): optional override; otherwise uses the builder's current storage.
- `contentType` (string): MIME type for uploads. Defaults to `image/png`.
- `siteName` / `accentColor` (strings): optional overrides for branding.
- `siteConfigPath` (string): path to a site config JSON; defaults to `config.json` in `process.cwd()`.

## Dependencies
- Uses fonts from `be/apps/core/src/modules/content/og/assets` (falls back to other repo paths). If fonts are missing, the plugin skips rendering for that run.
- Relies on the thumbnail storage plugin to provide in-memory thumbnail data when available; otherwise it will read a local/public or remote thumbnail URL.

## Notes
- Unsupported storage provider: `eagle` (the plugin disables itself in this case).
- Remote keys are cached; forcing (`isForceMode` or `isForceManifest`) re-renders and re-uploads.
- OG URLs are attached to `item.ogImageUrl` on the manifest entries.
