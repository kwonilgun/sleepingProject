/*
 * File: cartItems.tsx
 * Project: rootone0216
 * File Created: 2024-02-21
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * Copyright : 루트원 AI
 */

import { IProduct } from '../../../Screens/model/interface/IProductInfo';
// import {IProduct} from '../../../Screens/model/interface/IProductInfo';
import isEmpty from '../../../utils/isEmpty';

export interface CartItem {
  quantity: number;
  product: IProduct;
  // Add other properties of the CartItem interface as needed
}

interface AddToCartAction {
  type: 'ADD_TO_CART';
  payload: CartItem;
}

interface ChangeQuantityAction {
  type: 'CHANGE_QUANTITY';
  payload: CartItem;
}

interface RemoveFromCartAction {
  type: 'REMOVE_FROM_CART';
  payload: CartItem;
}

interface ClearCartAction {
  type: 'CLEAR_CART';
}

export type CartAction =
  | AddToCartAction
  | ChangeQuantityAction
  | RemoveFromCartAction
  | ClearCartAction;

export const cartReducer = (
  state: CartItem[] = [],
  action: CartAction,
): CartItem[] => {
  switch (action.type) {
    case 'ADD_TO_CART':
      if (isEmpty(state)) {
        return [action.payload];
      } else {
        let tmpState = state.filter(
          item => item.product.id !== action.payload.product.id,
        );
        return [...tmpState, action.payload];
      }

    case 'CHANGE_QUANTITY':
      if (isEmpty(state)) {
        return [action.payload];
      } else {
        return state.map(item =>
          item.product === action.payload.product
            ? {...item, quantity: action.payload.quantity}
            : item,
        );
      }

    case 'REMOVE_FROM_CART':
      const tmp_state = state.filter(item => {
        return item.product !== action.payload.product;
      });
      // console.log('tmp_state = ', tmp_state);
      return tmp_state;

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
};
