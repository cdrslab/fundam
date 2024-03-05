import { VALID_ROW_COLS } from './constants'

export const validateRowCol = (rowCol: number) => {
  if (!VALID_ROW_COLS.includes(rowCol)) {
    throw new Error(`rowCol value must be one of ${VALID_ROW_COLS.join(", ")}. Received ${rowCol}`)
  }
}

// 格式化options
interface OptionItem {
  label: string;
  value: any;
  children?: OptionItem[];
}
export function formatDataToOptions(data: Array<Record<string, any>>, labelKey: string = 'label', valueKey: string = 'value', childrenKey: string = 'children'): OptionItem[] {
  const options: OptionItem[] = [];

  data.forEach(item => {
    const option: OptionItem = {
      label: item[labelKey],
      value: item[valueKey]
    };

    if (item[childrenKey] && Array.isArray(item[childrenKey])) {
      option.children = formatDataToOptions(item[childrenKey], labelKey, valueKey, childrenKey);
    }

    options.push(option);
  });

  return options;
}

// 数据回显
type Option = {
  label: string;
  value: string | number;
  children?: Option[];
};
type Value = string | number | Value[] | Array<Value[]>;
function findLabelByValue(options: Option[], value: string | number, includeParent: boolean = false): string {
  for (const option of options) {
    if (option.value === value) {
      return includeParent ? option.label : '';
    }
    if (option.children) {
      const childLabel = findLabelByValue(option.children, value, true);
      if (childLabel) {
        return includeParent ? option.label + '-' + childLabel : childLabel;
      }
    }
  }
  return '';
}
export function getDisplayText(options: Option[], value: Value, separator: string = ','): string {
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      // 处理二维数组的情况 (如：Cascader-多选)
      return (value as Array<Value[]>).map(valArray => {
        let labels = valArray.map((val: any) => findLabelByValue(options, val, true));
        labels = labels.filter(label => label !== '');
        return labels.length ? labels[labels.length - 1] : '';
      }).join(separator);
    } else {
      // 处理一维数组的情况 (如：Select-多选)
      return (value as Value[]).map(val => findLabelByValue(options, val as string | number, true)).join(separator);
    }
  } else {
    // 处理单个值的情况 (如：Select-单选)
    return findLabelByValue(options, value as string | number, true);
  }
}
