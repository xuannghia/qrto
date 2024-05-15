export type QRData = string | Readonly<Array<number>>

export type QRColorGradient = {
  type: 'linear' | 'radial'
  colors: string[]
  
  /**
   * The offset of the gradient stop as a percentage of the gradient length (0 to 100)
   */
  offsets?: number[]
  rotate?: number

  /**
   * The coordinates of the gradient vector (x1, y1, x2, y2)
   * @default [0, 0, 100, 100]
   */
  coordinates?: [number, number, number, number]
}


export type QRColor = string | QRColorGradient

export type BaseOptions = {
  /**
   * Error correction level
   * L - The QR Code can tolerate about  7% erroneous codewords
   * M - The QR Code can tolerate about 15% erroneous codewords
   * Q - The QR Code can tolerate about 25% erroneous codewords
   * H - The QR Code can tolerate about 30% erroneous codewords
   * @default 'M'
   */
  ecLevel?: 'L' | 'M' | 'Q' | 'H'
  
  /**
   * Mask pattern used to encode the data
   * The mask number is either between 0 to 7 (inclusive) to force that mask, or -1 to automatically choose an appropriate mask (which may be slow)
   * @default -1
   */
  mask?: number

  /**
   * Minimum version of the QR code (1 to 40)
   * @default 1
   */
  minVersion?: number

  /**
   * Maximum version of the QR code (1 to 40)
   * @default 40
   */
  maxVersion?: number

  /**
   * Boost the error correction level if it can be done without increasing the version
   * Iff boostEcl is true, then the ECC level of the result may be higher than the ecl argument if it can be done without increasing the version
   * @default true
   */
  boostEcLevel?: boolean

  /**
   * Size of the QR code in pixels
   * @default 150
   */
  size?: number

  /**
   * Padding around the QR code in pixels
   * @default 10
   */
  padding?: number

  /**
   * Background color
   * @default '#ffffff'
   */
  backgroundColor?: QRColor

  /**
   * Foreground color
   * @default '#000000'
   */
  foregroundColor?: QRColor

  /**
   * Logo
   */
  logo?: {
    url: string
    /** @default 40 */ 
    size?: number
    /** @default 'circle' */
    style?: "square" | "circle" | "round"
    /** @default 2 */
    padding?: number
  }

  style?: "square" | "round" | "circle"

  marker?: {
    style?: "square" | "round" | "circle" | {
      inner: "square" | "round" | "circle"
      outer: "square" | "round" | "circle"
    }
    /** Default inherit from background */
    color?: string
  }
}

