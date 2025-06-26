// import {UserFormInput} from '../Screen/Login/model/interface/IAuthInfo';
// import {UserFormInput} from '../../Screen/model/interface/IAuthInfo';
import { UserFormInput } from '../../Screens/model/interface/IAuthInfo';
import isEmpty from '../../utils/isEmpty';

// 액션 타입 정의
export type AuthAction =
  | {type: 'LOGIN'; payload: {user: UserFormInput, loginMethod: 'apple' | 'google' | 'kakao' | 'email'}} // Modified LOGIN action
  | {type: 'LOGOUT'};

// 상태 타입 정의
export interface AuthState {
  routes: any;
  index: any;
  isAuthenticated: boolean;
  user: UserFormInput | null;
  loginMethod: 'apple' | 'google' | 'kakao' | 'email' | null; // Add this field

}

// 초기 상태
export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  index: null,
  routes: null,
  loginMethod: null,
};

// 리듀서 함수
export const authReducer = (
  state: AuthState,
  action: AuthAction,
): AuthState => {
  console.log('authReducer... action.type = ', action.type);

  switch (action.type) {
    case 'LOGIN':
      console.log('LOGIN action payload:', action.payload); // Log the payload for debugging
      const temp = {
        ...state,
        isAuthenticated: !isEmpty(action.payload.user), // Check if the user object is not empty
        user: action.payload.user,
        loginMethod: action.payload.loginMethod, // Set the login method
      };
      // console.log('Auth.context.tsx :LOGIN : temp = ', temp);
      return temp;
    case 'LOGOUT':
      // console.log('Auth.context.tsx :LOGOUT');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        // loginMethod: null, // Clear the login method on logout
      };
    default:
      return state;
  }
};