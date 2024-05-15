import { describe, it, expect } from 'vitest';
import fs from 'node:fs'
import { toSVG } from '../src'

const logoUrl = 'data:image/jpeg;base64,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'

describe('Styled QR', () => {
  it('with custom marker', async () => {
    const svg = toSVG("https://github.com/xuannghia/xqrcode", {
      style: 'circle',
      marker: {
        style: {
          outer: 'round',
          inner: 'circle',
        }
      },
      logo: {
        url: logoUrl,
      },
      foregroundColor: {
        type: 'linear',
        colors: ['#5271C1', '#0F1E43'],
      },
      backgroundColor: {
        type: 'linear',
        colors: ['#FFF9F9', '#FFC4C4'],
      },
    })
    fs.writeFileSync(__dirname + '/output/style-1.svg', svg)
    expect(svg).toBeDefined()
  })

  it('with custom marker', async () => {
    const svg = toSVG("https://github.com/xuannghia/xqrcode", {
      style: 'circle',
      marker: {
        style: {
          outer: 'round',
          inner: 'circle',
        }
      },
      logo: {
        url: 'https://avatars.githubusercontent.com/u/19240171?v=4',
      },
      foregroundColor: {
        type: 'linear',
        colors: ['#5271C1', '#0F1E43'],
      },
    })
    fs.writeFileSync(__dirname + '/output/style-2.svg', svg)
    expect(svg).toBeDefined()
  })
});