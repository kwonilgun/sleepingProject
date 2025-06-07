export function getAfterExclamation(input: string): string {
  const exclamationIndex = input.indexOf('!');
  if (exclamationIndex !== -1) {
    return input.substring(exclamationIndex + 1);
  }
  return '';
}

export function extractValues(
  input: string,
): {mode: string; time: string} | null {
  const exclamationIndex = input.indexOf('!');
  if (exclamationIndex === -1) {
    return null;
  }

  const afterExclamation = input.substring(exclamationIndex + 1);
  const modeMatch = afterExclamation.match(/\[([^\]]+)\]/);
  const timeMatch = afterExclamation.match(/\[(\d+)\]m/);

  if (modeMatch && timeMatch) {
    return {
      mode: modeMatch[1],
      time: timeMatch[1],
    };
  }

  return null;
}

//  const originalString = '오존 소독기 알림 메세지 도착![살균모드][30]분';
//  const extractedValues = extractValues(originalString);

//  if (extractedValues) {
//      console.log(`Mode: ${extractedValues.mode}, Time: ${extractedValues.time}`); // Mode: 살균모드, Time: 30
//  } else {
//      console.log('No valid pattern found');
//  }
