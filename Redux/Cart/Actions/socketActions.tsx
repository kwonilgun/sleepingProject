//  2023-02-23 : 주문 수량을 변경하기 위해서 추가

import {SocketItem} from '../Reducers/socketItems';

export const changeSocket = (payload: SocketItem) => {
  return {
    type: 'CHANGE_SOCKET',
    payload,
  };
};

export const addToSocket = (payload: SocketItem) => {
  return {
    type: 'ADD_TO_SOCKET',
    payload,
  };
};

export const removeFromSocket = (payload: SocketItem) => {
  return {
    type: 'REMOVE_FROM_SOCKET',
    payload,
  };
};

export const clearSocket = () => {
  return {
    type: 'CLEAR_SOCKET',
  };
};
