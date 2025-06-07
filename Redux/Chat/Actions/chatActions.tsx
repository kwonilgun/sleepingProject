//  2023-02-23 : 주문 수량을 변경하기 위해서 추가

import {ChatItem} from '../Reducers/chatReducer';

export const addToCart = (payload: ChatItem) => {
  return {
    type: 'ADD_TO_CHAT_PRODUCER',
    payload,
  };
};

export const removeFromChat = (payload: ChatItem) => {
  return {
    type: 'REMOVE_CHAT_PRODUCER',
    payload,
  };
};

export const clearChat = () => {
  return {
    type: 'CLEAR_CHAT_PRODUCER',
  };
};
