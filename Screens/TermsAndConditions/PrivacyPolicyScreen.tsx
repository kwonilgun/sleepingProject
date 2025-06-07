/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import strings from '../../constants/lang';
import colors from '../../styles/colors';
import {PrivacyPolicyScreenProps} from '../../Screens/model/types/TUserNavigator';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {baseURL} from '../../assets/common/BaseUrl';
import {
  OZS_PRIVACY_AGREEMENT_EN_ID,
  OZS_PRIVACY_AGREEMENT_ID,
  USAGE_TERM_ID,
  width,
} from '../../assets/common/BaseValue';
import {errorAlert} from '../../utils/alerts/errorAlert';
import RenderHtml from 'react-native-render-html';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import {useLanguage} from '../../context/store/LanguageContext';
import {RFPercentage} from 'react-native-responsive-fontsize';

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = props => {
  const [contents, setContents] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState<boolean>(false);
  const {language} = useLanguage();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (language === 'kr') {
          await getPrivatePolicyFromS3(setContents, setReady, 'kr');
        } else {
          await getPrivatePolicyFromS3(setContents, setReady, 'en');
        }
      };
      fetchData();

      return () => {
        setContents(undefined);
        setReady(false);
      };
    }, []),
  );
  const onPressLeft = () => {
    console.log('PrivacyPolicy.tsx: onPressLeft');
    props.navigation.navigate('SystemInfoScreen');
  };

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={onPressLeft}>
        <FontAwesome
          style={{
            height: RFPercentage(8),
            width: RFPercentage(10),
            marginTop: RFPercentage(2),
            color: colors.black,
            fontSize: RFPercentage(5),
            fontWeight: 'bold',
            // transform: [{scaleX: 1.5}], // 폭을 1.5배 넓힘
          }}
          name="arrow-left"
        />
      </TouchableOpacity>
    );
  };
  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText={strings.PRIVACY_POLICY}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        containerStyle={{paddingHorizontal: 8}}
        isRight={false}
      />

      {ready ? (
        <View style={{flex: 1}}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{flexGrow: 1}}>
            <RenderHtml contentWidth={width} source={{html: contents ?? ''}} />
          </ScrollView>
        </View>
      ) : (
        LoadingWheel()
      )}
    </WrapperContainer>
  );
};

async function getPrivatePolicyFromS3(
  setContents: React.Dispatch<React.SetStateAction<string | undefined>>,
  setReady: React.Dispatch<React.SetStateAction<boolean>>,
  language: string,
): Promise<void> {
  let response;

  try {
    if (language === 'kr') {
      response = await axios.get(`${baseURL}terms/${OZS_PRIVACY_AGREEMENT_ID}`);
    } else {
      response = await axios.get(
        `${baseURL}terms/${OZS_PRIVACY_AGREEMENT_EN_ID}`,
      );
    }

    if (response.status === 200) {
      const location = response.data[0]?.usageLocation.split('/').pop();
      if (!location) {
        throw new Error('Invalid usage location');
      }

      const res = await axios.get(`${baseURL}terms/downloadtext/${location}`);
      if (res.status === 200) {
        console.log('개인정보 동의서를  서버에서 성공적으로 가져옴');
        setContents(res.data);
      } else {
        setContents('UsageTerms.tsx: 데이터를 가져오지 못했습니다.');
      }
    } else {
      setContents('데이터 없음');
    }
  } catch (err) {
    console.log('개인정보 동의서 서버에서 가져오는 것 실패');
    errorAlert(strings.ERROR, strings.PRIVACY_POLICY);
    setContents('오류가 발생했습니다.');
  } finally {
    setReady(true);
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
    color: '#FFFFFF' /* 텍스트 색상 */,
    margin: RFPercentage(1),
    // marginHorizontal: 20,
  },
});

export default PrivacyPolicyScreen;
