import {Socket} from 'socket.io-client';

// 액션 타입 정의
export type socketAction =
  | {type: 'SET_SOCKET_ID'; socketId: Socket}
  | {type: 'RESET'};

// 상태 타입 정의
export interface socketState {
  socketId: Socket | null;
}

// 초기 상태
export const initialSocket: socketState = {
  socketId: null,
};

// 리듀서 함수
export const socketReducer = (
  state: socketState,
  action: socketAction,
): socketState => {
  console.log('SocketState... action.type = ', action.type);

  switch (action.type) {
    case 'SET_SOCKET_ID':
      const temp = {...state, socketId: action.socketId};

      // console.log('Socket_Login.tsx: SET_SOCKET_ID 새로운 state = ', temp);

      return temp;
    case 'RESET':
      console.log('badgeCountReducer: OFF');
      return {...state, socketId: null};
    default:
      return state;
  }
};
