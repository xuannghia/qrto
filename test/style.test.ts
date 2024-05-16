import { describe, it, expect } from 'vitest';
import fs from 'node:fs'
import { toSVG } from '../src'

const logoUrl = 'data:image/jpeg;base64,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'

describe('Styled QR', () => {
  it('with custom marker', async () => {
    const svg = toSVG("https://github.com/xuannghia/qrto", {
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

  it('with custom marker 2', async () => {
    const svg = toSVG("https://github.com/xuannghia/qrto", {
      style: 'round',
      marker: {
        style: 'round',
      },
      logo: {
        url: logoUrl,
      },
      foregroundColor: {
        type: 'linear',
        colors: ['#5271C1', '#0F1E43'],
      },
    })
    fs.writeFileSync(__dirname + '/output/style-2.svg', svg)
    expect(svg).toBeDefined()
  })

  it('npm style', async () => {
    const svg = toSVG("https://github.com/xuannghia/qrto", {
      style: 'circle',
      logo: {
        size: 30,
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAAAklEQVR4AewaftIAAAFwSURBVO3BsU0bAAAF0ePLXcQAySCUiBUYh8piI0aw3DIATWrqSG7SkRmQXETne+/uHb6I1ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojagSu7f3zk/umJfN/ldOJyPnNNB67s/umJX6+v5Ps+j0cu5zPXNKI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiduDG/H5+5lp+PDzw8+WF/9mBG/Pn7Y1bMqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiduDKLqcTn8cjt+DvxwefxyPXcjmduLa7d/giWiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNqI2ojaiNq/wAyOCE14wqH5wAAAABJRU5ErkJggg==',
      },
      foregroundColor: '#cb0001'
    })
    fs.writeFileSync(__dirname + '/output/style-npm.svg', svg)
    expect(svg).toBeDefined()
  })


  it('instagram style', async () => {
    const svg = toSVG("https://github.com/xuannghia/qrto", {
      style: 'circle',
      marker: {
        style: {
          outer: 'round',
          inner: 'circle',
        }
      },
      logo: {
        padding: 0,
        size: 30,
        style: 'round',
        url: 'data:image/png;base64,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',
      },
      foregroundColor: {
        type: 'linear',
        colors: ['#fd8d32', '#a307ba'],
      }
    })
    fs.writeFileSync(__dirname + '/output/style-instagram.svg', svg)
    expect(svg).toBeDefined()
  })
});