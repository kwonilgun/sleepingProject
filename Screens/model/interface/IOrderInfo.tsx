import {CartItem} from '../../../Redux/Cart/Reducers/cartItems';

export interface IOrderInfo {
  id: string;
  address1: string;
  address2: string;
  buyerName: string;
  buyerPhone: string;
  dateOrdered: string;
  deliveryMethod: number;
  // 2025-03-02 10:42:33, deliverDate 추가
  deliveryDate:Date;

  isPaid: boolean;
  orderItems: string[];
  orderNumber: string;
  orderPrice: number;
  producerName: string;
  producerPhone: string;
  realPayment: number;
  receiverName: string;
  receiverPhone: string;
  status: number;
  userId?: string;
}
