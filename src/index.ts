import { QrCode, Ecc } from './qrcode'
import type { QRData, BaseOptions, QRColor, QRColorGradient } from './types'

const EC_LEVEL = {
  'L': Ecc.LOW,
  'M': Ecc.MEDIUM,
  'Q': Ecc.QUARTILE,
  'H': Ecc.HIGH
}

function encode(data: QRData, options?: BaseOptions): QrCode {
  const ecl = EC_LEVEL[options?.ecLevel || 'M']
  return QrCode.encodeData(data, ecl, options?.minVersion, options?.maxVersion, options?.mask, options?.boostEcLevel)
}

function toGradientColor(color: QRColor): QRColorGradient | null {
  if (typeof color === 'string') return null
  if (color.type !== 'linear' && color.type !== 'radial') return null
  if (!Array.isArray(color.colors)) return null
  if (color.colors.length < 2) return null
  if (color.colors.some(c => typeof c !== 'string')) return null
  if (!color.offsets) color.offsets = Array.from({ length: color.colors.length }, (_, i) => Math.round(i * 100 / (color.colors.length - 1)))
  if (color.offsets.length !== color.colors.length) return null
  return color
}

function toFixed(n: number): number {
  return Number(n.toFixed(3))
}

function buildGradient(id: string, color: QRColorGradient): string {
  let svg = ''
  const [x1, y1, x2, y2] = color.coordinates || [0, 0, 100, 100]
    const rotate = color.rotate ?? 0
    svg += `<linearGradient gradientUnits="userSpaceOnUse" id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" gradientTransform="rotate(${rotate})">`
    for (let i = 0; i < color.colors.length; i++) {
      const offset = color.offsets?.[i] || 0
      svg += `<stop offset="${offset}%" stop-color="${color.colors[i]}"/>`
    }
    svg += `</linearGradient>`
  return svg
}

function getLogoInfo({ options, pixelSize, svgSize }: { options?: BaseOptions, pixelSize: number, svgSize: number }) {
  if (!options || !options.logo?.url) return null
  const size = options.logo?.size ?? toFixed(pixelSize * 4)
  const x = (svgSize - size) / 2
  const p = options.logo?.padding ?? 2
  let r = 0
  if (!options.logo?.style || options.logo?.style === 'circle') {
    r = size
  } else if (options.logo?.style === 'round') {
    r = size / 8
  }
  return {
    size,
    x,
    y: x,
    p,
    r,
    url: options.logo.url
  }
}

function getMarkerConfig({ options, pixelSize }: { options?: BaseOptions, pixelSize: number }) {
  let innerStyle
  let outerStyle

  if (typeof options?.marker?.style === 'object') {
    innerStyle = options.marker.style.inner ?? options.style
    outerStyle = options.marker.style.outer ?? options.style
  } else {
    innerStyle = options?.marker?.style ?? options?.style
    outerStyle = options?.marker?.style ?? options?.style
  }

  const innerRadius = innerStyle === 'circle' ? 7 * pixelSize : innerStyle === 'round' ? pixelSize : 0
  const outerRadius = outerStyle === 'circle' ? 7 * pixelSize : outerStyle === 'round' ? pixelSize : 0

  return {
    size: 7 * pixelSize,
    innerRadius,
    outerRadius
  }
}

export function toSVG(data: QRData, options?: BaseOptions): string {
  const qr = encode(data, options)
  const border = options?.padding ?? 10
  const size = options?.size ?? 150

  const pixelSize = toFixed(size / qr.size)
  const svgSize = size + 2 * border
  const bgColor = options?.backgroundColor || '#ffffff'
  const fgColor = options?.foregroundColor || '#000000'

  const gradientFgColor = toGradientColor(fgColor)
  const gradientFgId = 'gradient_foreground'
  const fgFill = gradientFgColor ? `url(#${gradientFgId})` : fgColor

  const gradientBgColor = toGradientColor(bgColor)
  const gradientBgId = 'gradient_background'
  const bgFill = gradientBgColor ? `url(#${gradientBgId})` : bgColor

  if (border < 0)
    throw new RangeError("Border must be non-negative");

  type Point = { x: number, y: number, w: number, h: number }
  let dots: Array<Point> = []

  function isMakerPoint(x: number, y: number) {
    return (x <= 7 && y <= 7) || (x <= 7 && y > qr.size - 8) || (x > qr.size - 8 && y <= 7)
  }
  
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) {
        const xx = toFixed(x * pixelSize + border)
        const yy = toFixed(y * pixelSize + border)
        if (isMakerPoint(x, y)) continue
        // if (isInMarkerArea(xx, yy)) continue
        // if (isInLogoArea(xx, yy)) continue
        // parts.push(`M${xx},${yy}h${pixelSize}v${pixelSize}h-${pixelSize}z`);
        dots.push({ x: xx, y: yy, w: pixelSize, h: pixelSize })
      }
    }
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${svgSize} ${svgSize}" width="${size}" height="${size}">`
  // Draw the background
  svg += `<rect width="100%" height="100%" fill="${bgFill}"/>`
  
  // Draw the foreground
  svg += `<g clip-path="url(#clip_foreground)">`

  // Draw the dots
  switch (options?.style) {
    case 'round':
      svg += dots.map(({ x, y, w, h }) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 3}" fill="${fgFill}"/>`).join("")
      break;
    case 'circle':
      svg += dots.map(({ x, y, w, h }) => `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2}" fill="${fgFill}"/>`).join("")
      break;
    default:
      svg += `<path d="${dots.map(({ x, y, w, h }) => `M${x},${y}h${w}v${h}h-${h}z`).join(" ")}" fill="${fgFill}"/>`
      break;
  }
  

  // Draw the markers
  const markerConfig = getMarkerConfig({ options, pixelSize })
  const markers = [
    { x: border, y: border, size: markerConfig.size },
    { x: border, y: border + (qr.size - 7) * pixelSize, size: markerConfig.size },
    { x: border + (qr.size - 7) * pixelSize, y: border, size: markerConfig.size },
  ]

  svg += markers.map((marker, idx) => {
    const markerId = `marker${idx + 1}`
    const innerSize = marker.size - 4 * pixelSize
    const maskSize = marker.size - 2 * pixelSize
    let markerSvg = ''
    // Outer
    markerSvg += `<rect x="${marker.x}" y="${marker.y}" width="${marker.size}" height="${marker.size}" rx="${markerConfig.outerRadius}" fill="${fgFill}"/>`
 
    // mask
    markerSvg += `<mask id="${markerId}_mask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="${marker.x + pixelSize}" y="${marker.y + pixelSize}" width="${maskSize}" height="${maskSize}">`
    markerSvg += `<rect x="${marker.x + pixelSize}" y="${marker.y + pixelSize}" width="${maskSize}" height="${maskSize}" rx="${markerConfig.outerRadius / 1.5}" fill="#ffffff"/>`
    markerSvg += `</mask>`
    markerSvg += `<g mask="url(#${markerId}_mask)">`
    markerSvg += `<rect x="${marker.x + pixelSize}" y="${marker.y + pixelSize}" width="${maskSize}" height="${maskSize}" rx="${markerConfig.outerRadius / 1.5}" fill="${bgFill}"/>`
    markerSvg += `</g>`

    // Inner
    markerSvg += `<rect x="${marker.x + 2 * pixelSize}" y="${marker.y + 2 * pixelSize}" width="${innerSize}" height="${innerSize}" rx="${markerConfig.innerRadius}" fill="${fgFill}"/>`
    return markerSvg
  }).join("")

  svg += `</g>`

  // Draw logo
  const logo = getLogoInfo({ options, svgSize, pixelSize })
  if (logo) {
    if (logo.p > 0) {
      // Logo background
      const logoBgX = logo.x - logo.p
      const logoBgY = logo.x - logo.p
      const logoBgSize = logo.size + 2 * logo.p
      const rxBackground = logo.r
      svg += `<mask id="logo_padding_mask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="${logoBgX}" y="${logoBgY}" width="${logoBgSize}" height="${logoBgSize}">`
      svg += `<rect x="${logoBgX}" y="${logoBgY}" width="${logoBgSize}" height="${logoBgSize}" rx="${rxBackground}" fill="#FFFFFF"/>`
      svg += `</mask>`
      svg += `<g mask="url(#logo_padding_mask)">`
      svg += `<rect x="${logoBgX}" y="${logoBgY}" width="${logoBgSize}" height="${logoBgSize}" fill="${bgFill}"/>`
      svg += `</g>`
    }
    // Logo
    svg += `<mask id="logo_mask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="${logo.x}" y="${logo.y}" width="${logo.size}" height="${logo.size}">`
    svg += `<rect x="${logo.x}" y="${logo.y}" width="${logo.size}" height="${logo.size}" rx="${logo.r}" fill="#FFFFFF"/>`
    svg += `</mask>`
    svg += `<g mask="url(#logo_mask)">`
    svg += `<rect x="${logo.x}" y="${logo.y}" width="${logo.size}" height="${logo.size}" fill="url(#logo_pattern)"/>`
    svg += `</g>`
  }


  svg += `<defs>`

  if (logo) {
    svg += `<pattern id="logo_pattern" patternContentUnits="objectBoundingBox" width="1" height="1">`
    svg += `<use href="#logo_image" transform="scale(0.01)" />`
    svg += `</pattern>`
    svg += `<image id="logo_image" href="${encodeURI(logo.url)}" width="100" height="100" />`
  }

  if (gradientFgColor) {
    svg += buildGradient(gradientFgId, gradientFgColor)
    svg += `<clipPath id="clip_foreground"><rect width="${svgSize}" height="${svgSize}" fill="white"/></clipPath>`
  }


  if (gradientBgColor) {
    svg += buildGradient(gradientBgId, gradientBgColor)
  }

  svg += `</defs>`
  svg += `</svg>`

  return svg
}