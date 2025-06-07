/*
 * File: store.tsx
 * Project: rootone0216
 * File Created: 2024-02-21
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * Copyright - 루트원 AI
 */

import {createStore, combineReducers} from 'redux';
// import thunkMiddleware from 'redux-thunk';
// import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

import {cartReducer} from '../Reducers/cartItems';
import {CartItem} from '../Reducers/cartItems';
import {CartAction} from '../Reducers/cartItems';
import {SocketAction, SocketItem, socketReducer} from '../Reducers/socketItems';
// import {chatReducer} from '../../Chat/Reducers/chatReducer';
// import {ChatItem} from '../../Chat/Reducers/chatReducer';
// import {ChatAction} from '../../Chat/Reducers/chatReducer';

// State 타입 정의
interface RootState {
  cart: (
    state: CartItem[] | undefined,
    action: CartAction,
  ) => CartItem[] /* 타입 정의 */; // cartItems 리듀서의 상태 타입에 따라서 정의
  socket: (state: SocketItem | undefined, action: SocketAction) => SocketItem;
}

//reducers 함수들을 여기서 지정을 한다.
const reducers = combineReducers<RootState>({
  cart: cartReducer,
  socket: socketReducer,
});

// 미들웨어 추가할 경우, applyMiddleware() 함수에 미들웨어를 추가하면 됨
// const middleware = /* 미들웨어 추가 */; // 필요한 미들웨어 추가

// Redux DevTools 확장 기능 사용 시 composeWithDevTools를 사용할 수 있음
// const composeEnhancers = composeWithDevTools({});

// createStore 함수에 미들웨어 추가 (compose 함수 사용 시)
const store = createStore(
  reducers,
  /* 초기 상태 설정 (optional) */
  //   compose(
  //     applyMiddleware(/* 추가한 미들웨어 */),
  //     // composeEnhancers(applyMiddleware(thunkMiddleware))
  //   )
);

export default store;
