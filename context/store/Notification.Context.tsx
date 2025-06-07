// 액션 타입 정의
export type notificationAction = {type: 'ON'} | {type: 'OFF'};

// 상태 타입 정의
export interface notificationState {
  isNotificationArrived: boolean;
}

// 초기 상태
export const initialStateNotification: notificationState = {
  isNotificationArrived: false,
};

// 리듀서 함수
export const notificationReducer = (
  state: notificationState,
  action: notificationAction,
): notificationState => {
  console.log('authReducer... action.type = ', action.type);

  switch (action.type) {
    case 'ON':
      console.log('notificationReducer: ON');
      const temp = {
        ...state,
        isNotificationArrived: true,
      };
      // console.log('Auth.context.tsx :LOGIN : temp = ', temp);
      return temp;
    case 'OFF':
      console.log('notificationReducer: OFF');
      return {...state, isNotificationArrived: false};
    default:
      return state;
  }
};
