/*
 * File: cartItems.tsx
 * Project: rootone0216
 * File Created: 2024-02-21
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * Copyright : 루트원 AI
 */

import {IProducerInfo} from '../../../Screens/model/interface/IAuthInfo';
import isEmpty from '../../../utils/isEmpty';

export interface ChatItem {
  producer: IProducerInfo;
  // Add other properties of the CartItem interface as needed
}

interface AddToChatAction {
  type: 'ADD_TO_CHAT_PRODUCER';
  payload: ChatItem;
}

interface RemoveFromChatAction {
  type: 'REMOVE_CHAT_PRODUCER';
  payload: ChatItem;
}

interface ClearChatAction {
  type: 'CLEAR_CHAT_PRODUCER';
}

export type ChatAction =
  | AddToChatAction
  | RemoveFromChatAction
  | ClearChatAction;

export const chatReducer = (
  state: ChatItem[] = [],
  action: ChatAction,
): ChatItem[] => {
  switch (action.type) {
    case 'ADD_TO_CHAT_PRODUCER':
      if (isEmpty(state)) {
        return [action.payload];
      } else {
        let tmpState = state.filter(
          item => item.producer.id !== action.payload.producer.id,
        );
        return [...tmpState, action.payload];
      }

    case 'REMOVE_CHAT_PRODUCER':
      const tmp_state = state.filter(item => {
        return item.producer !== action.payload.producer;
      });
      // console.log('tmp_state = ', tmp_state);
      return tmp_state;

    case 'CLEAR_CHAT_PRODUCER':
      return [];

    default:
      return state;
  }
};
