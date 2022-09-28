export type ValueType = string[] | Record<string, string> | Record<'label' | 'value', string>[]


/**
 * 将键值对，字符串数组转换成label，value这样的options数组
 * @param valueEnum
 * @returns
 */
export const valueEnumHandle = (valueEnum: ValueType) => {
  let options: Record<'label' | 'value', string>[] = [];
  /** 不是数组，是Record<string, string> 形式的 */
  if (valueEnum && !Array.isArray(valueEnum)) {
    Object.entries(valueEnum).forEach(([value, label]) => {
      if (['全部', '全选', '不限'].includes(label)) {
        options.unshift({ value, label });
      } else {
        options.push({ value, label });
      }
    });
  }
  if (valueEnum && Array.isArray(valueEnum)) {
    options = valueEnum.map((ele) => {
      if (typeof ele === 'object') {
        return ele;
      }
      return {
        value: ele,
        label: ele
      };
    });
  }
  return options;
}

/**
 * 整个数据，将无序的数据整合成映射map
 * @param list 无序的数据
 * @param valueKey value用的键名
 * @param labelKey label的键名
 * @returns
 */
export const handleToValue = (list: ValueType, valueKey = 'value', labelKey: 'label') => {
  const resMap = new Map<string | number, string>()
  for (let k in list) {
    let ele: string | Record<'label' | 'value', string>
    if (Array.isArray(list)) {
      ele = list[+k]
      /** 如果是string[]这样的类型，那就说明k也是要一致 */
      if (typeof ele === 'string') {
        k = ele
      }
    } else {
      ele = list[k]
    }
    /** 最终使用map的方式整合数据 */
    if (typeof ele === 'string') {
      resMap.set(k, ele)
    } else {
      resMap.set(ele.value, ele.label)
    }
  }
  return resMap;
}
