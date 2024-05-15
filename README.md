# xQRCode - Styled QR Code Generator

## Installation

```bash
npm install xqrcode
```

## `toSVG`


<img src="output-1.svg" height="160" />

### NodeJS

```javascript
const fs = require('fs')
const { toSVG } = require('xqrcode');

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
fs.writeFileSync('./qrcode.svg', svg)

```

### ReactJS

```jsx

import React from 'react';

import { toSVG } from 'xqrcode';

const App = () => {
  const svgString = toSVG("https://github.com/xuannghia/xqrcode", {
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

  return <div dangerouslySetInnerHTML={{ __html: svgString }} />
}

```

## `toCanvas`

Coming soon...