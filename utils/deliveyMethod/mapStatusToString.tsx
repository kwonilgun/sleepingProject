// 2023-10-10 : delivery status 추가

export const DELIVERY_DONE = '1'; //배송 완료됨

export const DELIVERY_PROCESSING = '2'; //배송처리 중

export const ORDERED_PRODUCT = '3'; // 상품 주문 받음

export const DELIVERY_READY = '4'; //배송 준비중

export function mapStatusToString(status: string) {
  switch (status) {
    case DELIVERY_DONE:
      return '배송완료';
    case DELIVERY_PROCESSING:
      return '배송처리 중';
    case ORDERED_PRODUCT:
      return '상품 주문 중';
    case DELIVERY_READY:
      return '배송 준비 중';
    default:
      return '알 수 없는 상태';
  }
}
