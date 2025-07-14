/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useState } from 'react';

import { ProfileScreenProps } from '../model/types/TUserNavigator';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import colors from '../../styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import { RFPercentage } from 'react-native-responsive-fontsize';
import strings from '../../constants/lang';
import { useFocusEffect } from '@react-navigation/native';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import GlobalStyles from '../../styles/GlobalStyles';
import { height, width } from '../../assets/common/BaseValue';
import { useAuth } from '../../context/store/Context.Manager';
import SleepTimerModal from '../Player/components/SleepTimerModal';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { UserFormInput } from '../model/interface/IAuthInfo';
import { jwtDecode } from 'jwt-decode';
import { getToken } from '../../utils/getSaveToken';
import SleepRecordsModal from '../Player/components/SleepRecordsModal';
import SleepAvgTimeModal from '../Player/components/SleepAvgTimeModal';
import SleepAvgStartTimeModal from '../Player/components/SleepAvgStartTimeModal';



export interface SleepRecord { // Define this interface to match your API response
  record_date: string;
  start_time: string | null;
  end_time: string | null;
}

const ProfileScreen: React.FC<ProfileScreenProps> = props => {
  const {state} = useAuth(); // Destructure getToken from useAuth
  const [loading, setLoading] = useState<boolean>(true);
  const [showSleepTimerOptions, setShowSleepTimerOptions] = useState<boolean>(false);
  const [showSleepAvgTimeOptions, setShowSleepAvgTimeOptions] = useState<boolean>(false);
  const [showSleepAvgStartTimeOptions, setShowSleepAvgStartTimeOptions] = useState<boolean>(false);
  const [showSleepTimeList, setShowSleepTimeList] = useState<boolean>(false);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]); // New state for sleep records
  const [recordsLoading, setRecordsLoading] = useState<boolean>(true); // New state for records loading


  useFocusEffect(
    useCallback(() => {
      console.log(
        'UserProfile.tsx: useFocusEffect : isAuthenticated = ',
        state.isAuthenticated,
      );

      fetchSleepRecords();

      return () => {
        // setUserProfile(null);
        setLoading(true);

      };
    }, []),
  );

  async function fetchSleepRecords() {
    setLoading(true); // Start loading
    // setShowSleepTimeList(true); // Show the modal immediately, with loading state

    const token = await getToken();
    if (!token) {
      // setRecordsLoading(false);
      console.log('token 이 없다.')
      return;
    }

    try {
      const decoded: UserFormInput = jwtDecode(token);
      const userId = decoded.userId;

      const response:AxiosResponse<SleepRecord[]> = await axios.get(`${baseURL}sleepRecord/records/${userId}`,
         {
              headers: {Authorization: `Bearer ${token}`},
            },
      );

      if (response.status === 200) {
        setSleepRecords(response.data);
        console.log('User sleep records:', response.data);
      } else {
        setSleepRecords([]); // Clear records if not 200
      }
    } catch (error) {
      console.error('Error fetching sleep records:', error);
      setSleepRecords([]); // Clear records on error
    } finally {
      setLoading(false); // End loading regardless of success or failure
    }
  }


  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      {/* <HeaderComponent
        rightPressActive={false}
        centerText={strings.USER_PROFILE}
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={false}
        onPressRight={() => {}}
        isRightView={false}
        rightText={''}
        // rightCustomView={RightCustomComponent}
      /> */}

      {loading ? (
        <>
          <LoadingWheel />
        </>
      ) : (
        <>
         
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={GlobalStyles.containerKey}>
              <ScrollView
                style={GlobalStyles.scrollView}
                keyboardShouldPersistTaps="handled">
                <View style={GlobalStyles.VStack}>

                  <Text
                      onPress={() => {
                        console.log('사용자 정보 클릭 ....');
                        props.navigation.navigate('SystemInfoScreen');
                      }}
                      style={styles.folderItemContainer}>
                        시스템 정보
                        {'  ▶️ ' } {/* 인디케이터 추가 */}
                  </Text>

                  <Text
                      onPress={() => {
                        console.log('수면 체크 주기 클릭');
                        setShowSleepTimerOptions(true);
                      }}
                      style={styles.folderItemContainer}>
                        수면 체크 시간
                        {'  ▶️ ' } {/* 인디케이터 추가 */}
                  </Text>

                  <Text
                      onPress={() => {
                        setShowSleepTimeList(true);
                        setRecordsLoading(false);
                      } // Call the new function here
                      }
                      style={styles.folderItemContainer}>
                        수면 기록
                        {'  ▶️ ' } {/* 인디케이터 추가 */}
                  </Text>

                   <Text
                      onPress={() => {
                        console.log('월별 평균 입면 시간 클릭');
                        setShowSleepAvgTimeOptions(true);
                        setRecordsLoading(false);
                      }}
                      style={styles.folderItemContainer}>
                        평균 입면 시간
                        {'  ▶️ ' } {/* 인디케이터 추가 */}
                  </Text>

                  <Text
                      onPress={() => {
                        console.log('월별 평균 수면 시작 시간 클릭');
                        setShowSleepAvgStartTimeOptions(true);
                        setRecordsLoading(false);
                      }}
                      style={styles.folderItemContainer}>
                        평균 수면 시작 시간
                        {'  ▶️ ' } {/* 인디케이터 추가 */}
                  </Text>

                  {/* Sleep Timer Options Modal */}
                  <SleepTimerModal
                    isVisible={showSleepTimerOptions}
                    onClose={() => setShowSleepTimerOptions(false)}
                  />

                  {/* Sleep Records List Modal */}
                  <SleepRecordsModal
                    isVisible={showSleepTimeList}
                    onClose={() => {
                      // setRecordsLoading(true);
                      setShowSleepTimeList(false);}
                    }
                    records={sleepRecords}
                    loading={recordsLoading}
                  />

                  <SleepAvgTimeModal
                    isVisible={showSleepAvgTimeOptions}
                    onClose={() => {
                      setShowSleepAvgTimeOptions(false);
                      // setRecordsLoading(true);
                      console.log('SleepingAvgTimeModal onClose ....');
                    }}
                    records={sleepRecords}
                    loading={recordsLoading}
                  />
                  <SleepAvgStartTimeModal
                    isVisible={showSleepAvgStartTimeOptions}
                    onClose={() => {
                      setShowSleepAvgStartTimeOptions(false);
                      // setRecordsLoading(true);
                      console.log('SleepingAvgTimeModal onClose ....');
                    }}
                    records={sleepRecords}
                    loading={recordsLoading}
                  />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>

        </>
      )}
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  userContainer:{
    flex: 1,
    flexDirection: 'row',
    width: width * 0.8,
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'center',

  },
  UserInfoBorderBox: {
    marginVertical: RFPercentage(1),
    padding: RFPercentage(1),
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: RFPercentage(2),
  },
  listContainer: {
    width: width * 0.9,
    marginVertical: RFPercentage(1),
    padding: RFPercentage(0.2),
    borderWidth: 1,
    borderRadius: RFPercentage(1),
    backgroundColor: '#E0E0E0',
  },
  itemContainer: {
    marginBottom: 10,
  },
  HStackTitle: {
    flexDirection: 'row',
    marginTop: RFPercentage(1),
    padding: RFPercentage(0.5),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  HeadTitleText: {
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    fontSize: RFPercentage(2),
    marginTop: RFPercentage(2),
    borderColor: 'blue',
    borderBottomWidth: 1,
  },

  folderItemContainer: {
    flexDirection: 'row',
    fontWeight: 'bold',
    fontSize: RFPercentage(2.5),
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    paddingRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },

  HCStack: {
    marginHorizontal: width * 0.1,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'center',

    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: RFPercentage(2),
    color: colors.white,
  },

  buttonTextStyle: {
    width: width * 0.2,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: RFPercentage(2), // Adjust the percentage based on your design
    padding: RFPercentage(0.5),
    color: 'black',
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: RFPercentage(1),
    // alignItems: 'center',
},
  searchButton: {
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    width: 'auto',
    height: 'auto',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#28a745',
    marginTop: RFPercentage(1),
    padding: RFPercentage(1),
    borderRadius: RFPercentage(1),
  },
  orderButton: {
    width: width * 0.88,
    height: 'auto',
    alignItems: 'center',
    backgroundColor: '#28a745',
    marginTop: RFPercentage(2),
    padding: RFPercentage(2),
    borderRadius: RFPercentage(1),
  },
  iconWrapper: {
    position: 'relative',
    width: 30, // 아이콘 크기에 맞게 조정
    height: 30, // 아이콘 크기에 맞게 조정
  },
  badge: {
    position: 'absolute',
    top: -(height * 0.022),
    right: - (width * 0.2),
    backgroundColor: 'red',
    borderRadius: 10,
    width: RFPercentage(2.2),
    height: RFPercentage(2.2),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // zIndex 추가
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputTitle: {
    fontWeight: 'bold',
    fontSize: RFPercentage(2.2),
    color: 'black',
    // marginTop: RFPercentage(1),
  },
});

export default ProfileScreen;