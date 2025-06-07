/*
 * File: ISocket.tsx
 * Project: market_2024_12_13
 * File Created: Saturday, 28th December 2024 3:03:09 pm
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * -----
 * Last Modified: Saturday, 28th December 2024 3:03:38 pm
 * Modified By: Kwonilgun(권일근) (kwonilgun@naver.com>)
 * -----
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 */

import {Socket} from 'socket.io-client';

// 사용자 정보에 대한 기본 정보
export interface ISocket {
  id: string;
  socketId: Socket;
  pingInterval: ReturnType<typeof setInterval> | null;
  pongInterval: ReturnType<typeof setTimeout> | null;
}

// // export interface IDeliveryInfo extends IAuth {
// //   address1: string;
// //   address2?: string;
// //   deliveryMethod: number;
// //   checkMark: boolean;
// // }

// export interface IAuthResult {
//   status: number;
//   data: any; // Adjust the type based on the actual response data structure
// }

// // 서버에서 사용자 번호에 대한 인증 대한 데이타 타입
// export interface IAuthInfo extends IAuth {
//   status: number;
//   message: string;
// }

// //인증된 이후의 사용자 정보 전달
// export interface UserFormInput extends IAuth {
//   userId?: string;
//   isAdmin?: boolean;
//   isProducer?: boolean;
//   password?: string;
// }

// export interface IUserAtDB {
//   bankName: string;
//   bankNumber: string;
//   dateCreated: Date;
//   deliveryInforms: [{}];
//   deviceId: string;
//   deviceToken: string;
//   email: string;
//   id: string;
//   isAdmin: boolean;
//   isProducer: boolean;
//   nickName: string;
//   ozsId: string;
//   phone: string;
//   token: string;
// }

// //전화번호 인증 코드에 대한 데이타 타입
// export interface IAuthVerify extends UserFormInput {
//   verify: string;
// }
