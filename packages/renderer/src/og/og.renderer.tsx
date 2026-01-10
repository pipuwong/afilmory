/** @jsxImportSource hono/jsx */
/** @jsxRuntime automatic */
import { Buffer } from 'node:buffer'

import { Resvg } from '@resvg/resvg-js'
import type { SatoriOptions } from 'satori'
import satori from 'satori'

import type { HomepageOgTemplateProps, OgTemplateProps } from './og.template'
import { HomepageOgTemplate, OgTemplate } from './og.template'
import { get_icon_code, load_emoji } from './tweemoji'

interface RenderOgImageOptions {
  template: OgTemplateProps
  fonts: SatoriOptions['fonts']
}

export async function renderOgImage({ template, fonts }: RenderOgImageOptions): Promise<Uint8Array> {
  const svg = await satori(<OgTemplate {...template} />, {
    width: 1200,
    height: 628,
    fonts,
    embedFont: true,
  })

  const svgInput = typeof svg === 'string' ? svg : Buffer.from(svg)
  const renderer = new Resvg(svgInput, {
    fitTo: { mode: 'width', value: 1200 },
    background: 'rgba(0,0,0,0)',
  })

  return renderer.render().asPng()
}

interface RenderHomepageOgImageOptions {
  template: HomepageOgTemplateProps
  fonts: SatoriOptions['fonts']
}

export async function renderHomepageOgImage({ template, fonts }: RenderHomepageOgImageOptions): Promise<Uint8Array> {
  const svg = await satori(<HomepageOgTemplate {...template} />, {
    width: 1200,
    height: 628,
    fonts,
    embedFont: true,
    async loadAdditionalAsset(code, segment) {
      if (code === 'emoji' && segment) {
        return `data:image/svg+xml;base64,${btoa(await load_emoji(get_icon_code(segment)))}`
      }
      return ''
    },
  })

  const svgInput = typeof svg === 'string' ? svg : Buffer.from(svg)
  const renderer = new Resvg(svgInput, {
    fitTo: { mode: 'width', value: 1200 },
    background: 'rgba(0,0,0,0)',
  })

  return renderer.render().asPng()
}
