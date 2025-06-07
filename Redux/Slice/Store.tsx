/*
 * File: Store.tsx
 * Project: rootone0216
 * File Created: Saturday, 2024-03-02
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * Copyright - 루트원 AI
 */

//참조 사이트 : https://adjh54.tistory.com/209

import {configureStore} from '@reduxjs/toolkit';
import RootReducer from './RootReducer';

export const Store = configureStore({
  reducer: RootReducer,
});

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
