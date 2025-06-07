// 액션 타입 정의
export type BadgeCountAction = {type: 'increment'} | {type: 'reset'};

// 상태 타입 정의
export interface BadgeCountState {
  isBadgeCount: number;
}

// 초기 상태
export const initialStateBadgeCount: BadgeCountState = {
  isBadgeCount: 0,
};

// 리듀서 함수
export const badgeCountReducer = (
  state: BadgeCountState,
  action: BadgeCountAction,
): BadgeCountState => {
  console.log('BadgeCount... action.type = ', action.type);

  switch (action.type) {
    case 'increment':
      console.log('badgeCountReducer: increment');
      const temp = {
        ...state,
        isBadgeCount: state.isBadgeCount + 1,
      };
      console.log('BadgeCount.context.tsx : temp = ', temp);
      return temp;
    case 'reset':
      console.log('badgeCountReducer: OFF');
      return {...state, isBadgeCount: 0};
    default:
      return state;
  }
};
