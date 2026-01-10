'use strict'
import { Buffer } from 'node:buffer'

import { Resvg } from '@resvg/resvg-js'
import { jsx } from 'hono/jsx/jsx-runtime'
import satori from 'satori'

import { HomepageOgTemplate, OgTemplate } from './og.template'
import { get_icon_code, load_emoji } from './tweemoji'

export async function renderOgImage({ template, fonts }) {
  const svg = await satori(/* @__PURE__ */ jsx(OgTemplate, { ...template }), {
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
export async function renderHomepageOgImage({ template, fonts }) {
  const svg = await satori(/* @__PURE__ */ jsx(HomepageOgTemplate, { ...template }), {
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
