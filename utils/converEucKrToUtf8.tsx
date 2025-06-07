// EUC-KR 문자열을 UTF-8로 변환하는 함수
import iconv from 'iconv-lite';


export const convertEucKrToUtf8 = (eucKrString: string): string => {
  if (!eucKrString) {
    return '';
  }
  try {
    // 1. 깨진 EUC-KR 문자열을 'binary' (또는 'latin1') 인코딩으로 간주하여 바이트 배열로 변환
    //    이 단계에서 iconv-lite가 내부적으로 Buffer와 유사한 작업을 수행합니다.
    const encodedBytes = iconv.encode(eucKrString, 'binary');

    // 2. 바이트 배열을 'EUC-KR'로 디코딩하여 올바른 UTF-8 문자열로 변환
    const decodedString = iconv.decode(encodedBytes, 'EUC-KR');

    return decodedString;
  } catch (error) {
    console.error('Error converting EUC-KR to UTF-8:', error);
    // 변환 실패 시 원본 문자열 반환 (깨진 상태 유지) 또는 오류 메시지 반환
    return eucKrString;
  }
};