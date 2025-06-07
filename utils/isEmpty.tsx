// 2024-06-12 : Date empty 체크 추가

const isEmpty = (value: any): boolean =>
  value === undefined ||
  value === null ||
  value === 'null' ||
  value === 'undefined' ||
  (typeof value === 'object' &&
    !(value instanceof Date) &&
    Object.keys(value).length === 0) ||
  (typeof value === 'object' &&
    value instanceof Date &&
    isNaN(value.getTime())) ||
  (typeof value === 'string' && value.trim().length === 0);

export default isEmpty;
