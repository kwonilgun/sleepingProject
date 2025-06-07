export function areJsonEqual(json1: any, json2: any): boolean {
  return JSON.stringify(json1) === JSON.stringify(json2);
}
