//  2023-02-23 : 주문 수량을 변경하기 위해서 추가

import {CartItem} from '../Reducers/cartItems';

export const changeQuantity = (payload: CartItem) => {
  return {
    type: 'CHANGE_QUANTITY',
    payload,
  };
};

export const addToCart = (payload: CartItem) => {
  return {
    type: 'ADD_TO_CART',
    payload,
  };
};

export const removeFromCart = (payload: CartItem) => {
  return {
    type: 'REMOVE_FROM_CART',
    payload,
  };
};

export const clearCart = () => {
  return {
    type: 'CLEAR_CART',
  };
};
