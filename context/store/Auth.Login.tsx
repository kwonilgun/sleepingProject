// import {UserFormInput} from '../Screen/Login/model/interface/IAuthInfo';
import {UserFormInput} from '../../Screen/model/interface/IAuthInfo';
import isEmpty from '../../utils/isEmpty';

// 액션 타입 정의
export type AuthAction =
  | {type: 'LOGIN'; payload: UserFormInput}
  | {type: 'LOGOUT'};

// 상태 타입 정의
export interface AuthState {
  routes: any;
  index: any;
  isAuthenticated: boolean;
  user: UserFormInput | null;
}

// 초기 상태
export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
};

// 리듀서 함수
export const authReducer = (
  state: AuthState,
  action: AuthAction,
): AuthState => {
  console.log('authReducer... action.type = ', action.type);

  switch (action.type) {
    case 'LOGIN':
      // console.log('LOGIN');
      const temp = {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload,
      };
      // console.log('Auth.context.tsx :LOGIN : temp = ', temp);
      return temp;
    case 'LOGOUT':
      // console.log('Auth.context.tsx :LOGOUT');
      return {...state, isAuthenticated: false, user: null};
    default:
      return state;
  }
};
