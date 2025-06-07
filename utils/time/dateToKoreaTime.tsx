export function dateToKoreaTime(date: Date | null): string | null {
  if (date !== null && date !== undefined) {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      // timeZoneName: "short",
      // timeZone: "Asia/Seoul"
    }).format(date);
  } else {
    //     devLOGError('dateToKoreaTime.ts: date가 null 이다.');
    return null;
  }
}

export function dateToKoreaDate(date: Date | null | undefined): string | null {
  if (date instanceof Date) {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Seoul',
    }).format(date);
  } else {
    // date가 Date 객체가 아닌 경우 오류 메시지 출력 또는 다른 방식으로 처리
    console.error('dateToKoreaDate.ts: date가 Date 객체가 아닙니다.');
    return null; // 또는 다른 기본값 반환
  }
}

// export function dateToKoreaDate(date: Date | null): string | null {
//   if (date !== null && date !== undefined) {
//     return new Intl.DateTimeFormat('ko-KR', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       // hour: '2-digit',
//       // minute: '2-digit',
//       // second: '2-digit',
//       timeZone: "Asia/Seoul"
//     }).format(date);
//   } else {
//     //     devLOGError('dateToKoreaTime.ts: date가 null 이다.');
//     return null;
//   }
// }
