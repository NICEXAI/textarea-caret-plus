import { utils } from './utils'

const NORMAL_STYLE_NAMES = [
  'width',
  'height',
  'max-width',
  'max-height',
  'min-width',
  'min-height',
  'padding-top',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'border',
  'box-sizing',
  'line-height',
  'text-indent',
  'text-align',
  'font-size',
  'font-family',
  'font-weight',
  'font-style',
  'font-variant',
  'letter-spacing',
  'white-space',
  'word-spacing',
  'word-wrap',
  'word-break',
  'position',
  'overflow',
]

export class DomMeasurement {
  public getStyles(element: HTMLElement, styleNames = NORMAL_STYLE_NAMES): Record<string, string> {
    const styles = this.getStylesByNames(element, styleNames)
    const result: Record<string, string> = {}
    Object.keys(styles).forEach((key) => {
      result[utils.camelizeKey(key)] = styles[key]
    })
    return result
  }

  /**
   * Gets the DOM node style string
   * @param element
   * @param styleNames
   * @returns
   */
  public getCssText(element: HTMLElement, styleNames = NORMAL_STYLE_NAMES) {
    const styles = this.getStylesByNames(element, styleNames)
    return Object.keys(styles)
      .map((key) => {
        return `${key}: ${styles[key]};`
      })
      .join(';')
  }

  public getFontStyles(element: HTMLElement) {
    const styles = window.getComputedStyle(element)
    return {
      fontFamily: styles.getPropertyValue('font-family'),
      fontSize: parseFloat(styles.getPropertyValue('font-size')),
      fontWeight: parseFloat(styles.getPropertyValue('font-weight')),
      lineHeight: parseFloat(styles.getPropertyValue('line-height')),
    }
  }

  public getContentBox(element: HTMLElement) {
    return {
      width: element.scrollWidth,
      height: element.scrollHeight,
    }
  }

  public getScrollbarWidth(element: HTMLElement) {
    const styles = window.getComputedStyle(element)
    const borderLeftWidth = parseFloat(styles.getPropertyValue('border-left-width')) || 0
    const borderRightWidth = parseFloat(styles.getPropertyValue('border-right-width')) || 0
    return element.offsetWidth - element.clientWidth - borderLeftWidth - borderRightWidth
  }

  public getStyle(element: HTMLElement, styleName: string): string {
    const styles = window.getComputedStyle(element)
    return styles.getPropertyValue(styleName)
  }

  /**
   * The percentage in the converted style is pixels
   * @param element node
   * @param name style name
   * @param value percentage value
   * @returns pixel value
   */
  private convertPercentToPx(element: HTMLElement, name: string, value: string) {
    if (!value.includes('%')) {
      return value
    }

    const percent = parseFloat(value) / 100
    const parent = element.parentElement
    if (!parent) {
      return 'none'
    }

    const parentStyles = window.getComputedStyle(parent)
    const parentWidth = parseFloat(parentStyles.getPropertyValue('width'))
    const parentHeight = parseFloat(parentStyles.getPropertyValue('height'))
    const boxSizing = parentStyles.getPropertyValue('box-sizing')
    const borderWidth = parseFloat(parentStyles.getPropertyValue('border-width'))
    const paddingLeft = parseFloat(parentStyles.getPropertyValue('padding-left'))
    const paddingRight = parseFloat(parentStyles.getPropertyValue('padding-right'))
    const paddingTop = parseFloat(parentStyles.getPropertyValue('padding-top'))
    const paddingBottom = parseFloat(parentStyles.getPropertyValue('padding-bottom'))

    let parentContentWidth = parentWidth
    let parentContentHeight = parentHeight
    if (boxSizing === 'border-box') {
      parentContentWidth = parentWidth - paddingLeft - paddingRight - borderWidth * 2
      parentContentHeight = parentHeight - paddingTop - paddingBottom - borderWidth * 2
    }

    if (name.includes('height')) {
      return `${parentContentHeight * percent}px`
    }
    return `${parentContentWidth * percent}px`
  }

  /**
   * Gets the DOM node style string
   * @param element dom node
   * @param styleNames 
   * @returns 
   */
  private getStylesByNames(element: HTMLElement, styleNames = NORMAL_STYLE_NAMES): Record<string, string> {
    const styles = window.getComputedStyle(element)
    const result: Record<string, string> = {}
    styleNames.map((name) => {
      const styleName = utils.camelizeKey(name)
      const value = styles.getPropertyValue(name)

      // If the width and height are auto, continue trying to get the real pixels
      if (['width', 'height'].includes(name) && value === 'auto') {
        const boundingRect = element.getBoundingClientRect() as unknown as Record<string, string>
        result[name] = `${boundingRect[styleName]}px`
        return
      }

      // The maximum and minimum width and height are converted from percentages to pixels
      if (['max-width', 'max-height', 'min-width', 'min-height'].includes(name)) {
        result[name] = this.convertPercentToPx(element, name, value)
        return
      }

      result[name] = value
    })

    return result
  }
}
