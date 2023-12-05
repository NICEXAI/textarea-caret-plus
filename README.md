# Textarea Caret Plus

[![npm version](https://badge.fury.io/js/textarea-caret-plus.svg)](https://badge.fury.io/js/textarea-caret-plus)
[![npm downloads](https://img.shields.io/npm/dm/textarea-caret-plus.svg)](https://www.npmjs.com/package/textarea-caret-plus)
[![npm license](https://img.shields.io/npm/l/textarea-caret-plus.svg)](https://www.npmjs.com/package/textarea-caret-plus)

Compared with [textarea-caret](https://github.com/component/textarea-caret-position), Textarea Caret Plus can obtain more precise and rich position information, and supports input, textarea and simple text nodes. (For example: `<div>hello, textarea caret plus</div>`).

How it's done: a faux `<div>` is created off-screen and styled exactly like the
`textarea` or `input`. Then, the text of the element up to the caret is copied
into the `div` and a `<span>` is inserted right after it. Then, the text content
of the span is set to the remainder of the text in the `<textarea>`, in order to
faithfully reproduce the wrapping in the faux `div` (because wrapping can push
the currently typed word onto the next line). The same is done for the
`input` to simplify the code, though it makes no difference. Finally, the span's
offset within the `textarea` or `input` is returned.

### Install

```
npm i textarea-caret-plus
or
yarn add textarea-caret-plus
```

pnpm users install in the same way as npm, please refer to [pnpm document](https://pnpm.js.org/zh/installation) for details


### Usage

#### Sample Usage

if you only need to measure the text in the node once and confirm that it will not be modified again, then you can use the following method:

```tsx
import { TextMeasurement } from 'textarea-caret-plus'

const textMeasurement = new TextMeasurement()
const element = document.querySelector('textarea')
const rect = textMeasurement.measureText(element, element.value, 0)
console.log(rect)

// destroy the instance when you are sure you will no longer use it
textMeasurement.destroy()
```

#### Recommended Usage

if you need to measure the text in the node multiple times, in order to ensure better performance, it is recommended to use the following method:

```tsx
import { TextMeasurement } from 'textarea-caret-plus'

// It is recommended to use the instantiated TextMeasurement object as a global variable to avoid repeated creation
const textMeasurement = new TextMeasurement()
const element = document.querySelector('textarea')
const ins = textMeasurement.preload(element, element.value)
const rect1 = ins.measureText(0)
console.log(rect1)
const rect2 = ins.measureText(1)
console.log(rect2)

// destroy the instance when you are sure you will no longer use it
textMeasurement.destroy()
```

### License
Apache License 2.0