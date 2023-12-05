class Utils {
   /**
   * Convert a key string to a camel-named (e.g. "someName") string
   * @param key string type
   * @param separators key 
   */
    camelizeKey(key: string, separators: string[] = ['-', '_']): string {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const out: any = []
      let i = 0
      const separatorsSet = new Set(separators)
      while (i < key.length) {
        if (separatorsSet.has(key[i])) {
          out.push(key[i + 1].toUpperCase())
          i++
        } else {
          out.push(key[i])
        }
        i++
      }
      return out.join('')
    }
}

export const utils = new Utils()