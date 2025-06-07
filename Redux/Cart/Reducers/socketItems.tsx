/* eslint-disable no-fallthrough */
/*
 * File: socketItems.tsx
 * Project: market_2024_12_13
 * File Created: Saturday, 28th December 2024 2:54:56 pm
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * -----
 * Last Modified: Saturday, 28th December 2024 2:55:27 pm
 * Modified By: Kwonilgun(권일근) (kwonilgun@naver.com>)
 * -----
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 */

import {ISocket} from '../../../Screens/model/interface/ISocket';
import isEmpty from '../../../utils/isEmpty';

export interface SocketItem {
  socket: ISocket | undefined;
}

interface AddToSocketAction {
  type: 'ADD_TO_SOCKET';
  payload: SocketItem;
}

interface ChangeSocketAction {
  type: 'CHANGE_SOCKET';
  payload: SocketItem;
}

interface RemoveFromSocketAction {
  type: 'REMOVE_FROM_SOCKET';
  payload: SocketItem;
}

interface ClearSocketAction {
  type: 'CLEAR_SOCKET';
}

export type SocketAction =
  | AddToSocketAction
  | ChangeSocketAction
  | RemoveFromSocketAction
  | ClearSocketAction;

export const socketReducer = (
  state: SocketItem = {
    socket: undefined,
  },
  action: SocketAction,
): SocketItem => {
  switch (action.type) {
    case 'ADD_TO_SOCKET':
      if (isEmpty(state)) {
        //   return [action.payload];
        // } else {
        //   let tmpState = state.filter(
        //     item => item.socket.id !== action.payload.socket.id,
        //   );
        return action.payload;
      }

    // case 'CHANGE_SOCKET':
    //   if (isEmpty(state)) {
    //     return action.payload;
    //   } else {
    //     return state.map(item =>
    //       item.socket === action.payload.socket
    //         ? {...item, quantity: action.payload.socket}
    //         : item,
    //     );
    //   }

    case 'REMOVE_FROM_SOCKET':
      // const tmp_state = state.filter(item => {
      //   return item.socket !== action.payload.socket;
      // });
      // // console.log('tmp_state = ', tmp_state);
      return {socket: undefined};

    case 'CLEAR_SOCKET':
      return {socket: undefined};

    default:
      return state;
  }
};
