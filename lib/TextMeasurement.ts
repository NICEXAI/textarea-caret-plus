import { DomMeasurement } from './DomMeasurement'

export interface TextNodeBoxRect {
  left: number
  right: number
  top: number
  bottom: number
  width: number
  height: number
  // deviation
  deviation: number
}

/**
 * TextMeasurement
 *
 * Example：
 * Computes the coordinate position of the first character in a node, pseudocode:
 * import { TextMeasurement } from 'textarea-caret-plus'
 *
 * const textMeasurement = new TextMeasurement()
 * const element = document.querySelector('textarea')
 * const rect = textMeasurement.measureText(element, element.text, 0)
 * console.log(rect)
 */
export class TextMeasurement {
  // Textarea mirror node
  private nodeId = 'tcp_mirror-text-node'
  private mirrorTextNode!: HTMLDivElement
  private domMeasurement = new DomMeasurement()

  constructor() {
    if (!document) {
      throw new Error('TextareaMeasurement can only be run under DOM environment')
    }

    this.registerMirrorRootNode()
  }

  /**
   * Measures the position of the specified character within the Textarea node
   * @param element dom node
   * @param text text content
   * @param index character index
   * @returns
   */
  public measureText(element: HTMLElement, text: string, index: number): TextNodeBoxRect {
    const display = this.domMeasurement.getStyle(element, 'display')
    const cssText = this.domMeasurement.getCssText(element)
    this.mirrorTextNode.style.cssText = cssText
    // this.mirrorTextNode.style.display = 'table'
    if (display === 'inline') {
      this.mirrorTextNode.style.textAlign = 'initial'
    }

    this.mirrorTextNode.innerHTML = text
      .split('')
      .map((char) => {
        return `<span>${char}</span>`
      })
      .join('')

    return this.doMeasureText({ element, display, text, index })
  }

  /**
   * Load the node and the text content
   * @param element dom node
   * @param text text content
   * @returns measureText function
   */
  public preload(element: HTMLElement, text: string) {
    const display = this.domMeasurement.getStyle(element, 'display')
    const containerWidth = parseFloat(this.domMeasurement.getStyle(element, 'width'))
    const scrollbarWidth = this.domMeasurement.getScrollbarWidth(element)
    // Need to add 1px to prevent the last character from being wrapped
    const contentWidth = containerWidth - scrollbarWidth

    let cssText = this.domMeasurement.getCssText(element)
    cssText += `; height: auto; max-height: none; width: ${contentWidth}px; overflow: hidden;`
    if (display === 'inline') {
      cssText += '; text-align: initial'
    }

    this.mirrorTextNode.style.cssText = cssText
    // this.mirrorTextNode.style.display = 'table'
    this.mirrorTextNode.innerHTML = text
      .split('')
      .map((char) => {
        return `<span>${char}</span>`
      })
      .join('')

    return {
      measureText: (index: number) => {
        return this.doMeasureText({ element, display, text, index })
      },
    }
  }

  public destroy() {
    this.unRegisterMirrorRootNode()
  }

  private doMeasureText(params: {
    element: HTMLElement
    display: string
    index: number
    text: string
  }) {
    const { element, display, index, text } = params
    if (index < 0 || index > text.length - 1) {
      throw new Error(
        `char indexing(index: ${index})overflowed, allowed range:0 - ${text.length - 1}`
      )
    }

    const span = this.mirrorTextNode.querySelector(
      `span:nth-child(${index + 1})`
    ) as HTMLSpanElement

    const { offsetLeft, offsetTop, offsetHeight, offsetWidth } = span

    // Correction of error value
    let deviation = 0
    if (display === 'inline') {
      const firstSpan = this.mirrorTextNode.querySelector('span:nth-child(1)') as HTMLSpanElement
      if (firstSpan) {
        deviation = firstSpan.offsetTop
      }
    }

    // Fixed an error where the last newline character did not take effect
    let top = offsetTop
    let left = offsetLeft
    if (text[index] === '\n' && index === text.length - 1) {
      const lineHeight = parseFloat(this.domMeasurement.getStyle(element, 'line-height'))
      top += lineHeight
      left = 0
    }

    return {
      left,
      right: left + offsetWidth,
      top,
      bottom: top + offsetHeight,
      width: offsetWidth,
      height: offsetHeight,
      deviation,
    }
  }

  /**
   * Register the root node of the mirror
   */
  private registerMirrorRootNode() {
    let mirrorContainer = document.getElementById(this.nodeId) as HTMLDivElement
    if (mirrorContainer) {
      this.mirrorTextNode = mirrorContainer.shadowRoot?.firstChild as HTMLDivElement
      if (!this.mirrorTextNode) {
        throw new Error('The mirror node is not initialized')
      }
      return
    }

    mirrorContainer = document.createElement('div')
    mirrorContainer.setAttribute('contenteditable', 'false')
    mirrorContainer.id = this.nodeId
    mirrorContainer.style.position = 'absolute'
    mirrorContainer.style.width = '0px'
    mirrorContainer.style.height = '0px'
    mirrorContainer.style.overflow = 'hidden'
    document.body.appendChild(mirrorContainer)

    const mirrorShadowRoot =
      mirrorContainer.shadowRoot || mirrorContainer.attachShadow({ mode: 'open' })
    if (!this.mirrorTextNode) {
      const mirrorTextNode = document.createElement('div')
      mirrorTextNode.className = 'mirror-text-container'
      mirrorShadowRoot.appendChild(mirrorTextNode)
      this.mirrorTextNode = mirrorTextNode
      this.mirrorTextNode.style.display = 'block'
    }
  }

  /**
   * Unregister the root node of the mirror
   */
  private unRegisterMirrorRootNode() {
    const mirrorContainer = document.getElementById(this.nodeId) as HTMLDivElement
    if (mirrorContainer) {
      document.body.removeChild(mirrorContainer)
    }
  }
}
