/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useState} from 'react';
import {ScrollView, TouchableOpacity, StyleSheet, View, SafeAreaView} from 'react-native';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import strings from '../../constants/lang';
import {UsageTermScreenProps} from '../../Screens/model/types/TUserNavigator';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {baseURL} from '../../assets/common/BaseUrl';
import {
  height,
  OZS_USAGE_TERM_EN_ID,
  OZS_USAGE_TERM_ID,
  USAGE_TERM_ID,
  width,
} from '../../assets/common/BaseValue';
import {errorAlert} from '../../utils/alerts/errorAlert';
import RenderHTML  from 'react-native-render-html';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import {useLanguage} from '../../context/store/LanguageContext';
import colors from '../../styles/colors';
import {RFPercentage} from 'react-native-responsive-fontsize';
import fontFamily from '../../styles/fontFamily';


const renderersProps = {
  a: {
    onPress: (event: any, href: any) => {
      console.log('링크 클릭됨:', href);
    },
  },
};

const htmlContent = `
    <h1>이용 약관</h1>
    <p>본 이용 약관은 [회사명]이 제공하는 서비스 이용에 대한 기본적인 사항을 규정합니다.</p>

    <h2>제1조 (목적)</h2>
    <p>본 약관은 [회사명] (이하 "회사"라 합니다)이 제공하는 [서비스명] 및 관련 제반 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

    <h2>제2조 (정의)</h2>
    <ul>
        <li>"서비스"라 함은 구현되는 단말기(PC, 휴대형 단말기 등의 각종 유무선 장치를 포함)와 상관없이 회원이 이용할 수 있는 [회사명] 및 관련 제반 서비스를 의미합니다.</li>
        <li>"회원"이라 함은 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
    </ul>
    <p>...</p>

    <p class="last-modified">최종 수정일: 2025년 6월 30일</p>
`;

// You can define custom styles to match your HTML CSS
// const baseStyle = {
//   fontFamily: 'Arial, sans-serif',
//   lineHeight: 2,
//   paddingHorizontal: 30, // Corresponds to padding: 30px
//   backgroundColor: '#f9f9f9',
//   color: 'black',
// };

export const tagsStyles = {
  h1: {
    color: '#2c3e50',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 40,
    fontSize: RFPercentage(2), // Approximation of 2.5em
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: 'grey',
    // paddingBottom: 15,
  },
  h2: {
    color: '#34495e',
    marginTop: 30,
    marginBottom: 15,
    fontSize: RFPercentage(2), // Approximation of 1.8em
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
    paddingLeft: 10,
  },
  p: {
    marginBottom: 15,
    textAlign: 'justify',
    fontSize: 16, // Approximation of 1.1em
    paddingLeft: 20,
  },
  ul: {
    marginLeft: 40,
    marginBottom: 15,
    fontSize: 16,
  },
  li: {
    marginBottom: 8,
    textAlign: 'justify',
  },
};

// const classesStyles = {
//   'last-modified': {
//     textAlign: 'right',
//     marginTop: 50,
//     fontSize: 12, // Approximation of 0.9em
//     color: '#777',
//   },
// };

const UsageTermScreen: React.FC<UsageTermScreenProps> = props => {
  const [contents, setContents] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState<boolean>(false);
  const {language} = useLanguage();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (language === 'kr') {
          await getUsageTermsFromS3(setContents, setReady, 'kr');
        } else {
          await getUsageTermsFromS3(setContents, setReady, 'en');
        }
      };
      fetchData();

      return () => {
        setContents(undefined);
        setReady(false);
      };
    }, [language]),
  );
  const onPressLeft = () => {
    console.log('UsageTermScreen.tsx: onPressLeft');
    props.navigation.navigate('SystemInfoScreen');
  };

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={onPressLeft}>
        <>
          <Icon
            style={{color: colors.lightBlue, fontSize: RFPercentage(5)}}
            name="arrow-left"
          />
        </>
      </TouchableOpacity>
    );
  };

  


  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText={strings.TERMS_OF_SERVICE}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        containerStyle={{paddingHorizontal: 8}}
        isRight={false}
      />

      {ready ? (
        <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <RenderHTML
          contentWidth={width}
          // source={{ html: htmlContent || ''}}
          source={{ html: contents || ''}}
          // baseStyle={baseStyle}
          tagsStyles={tagsStyles}
          // classesStyles={classesStyles}
          // Potentially add renderers for more complex elements if needed
        />
      </ScrollView>
    </SafeAreaView>
      ) : (
        LoadingWheel()
      )}
    </WrapperContainer>
  );
};

async function getUsageTermsFromS3(
  setContents: React.Dispatch<React.SetStateAction<string | undefined>>,
  setReady: React.Dispatch<React.SetStateAction<boolean>>,
  language: string,
): Promise<void> {
  let response;
  console.log('UsageTermScreen: language = ', language);
  try {
    if (language === 'kr') {
      response = await axios.get(`${baseURL}terms/${USAGE_TERM_ID}`);
    } else {
      response = await axios.get(`${baseURL}terms/${OZS_USAGE_TERM_EN_ID}`);
    }
    if (response.status === 200) {
      console.log('이용약관을  서버에서 성공 response.data = ', response.data);
      setContents(response.data);

    } else {
      setContents('데이터 없음');
    }
  } catch (err) {
    console.log('이용약관을 서버에서 가져오는 것 실패');
    errorAlert(strings.ERROR, strings.PRIVACY_POLICY);
    setContents('오류가 발생했습니다.');
  } finally {
    setReady(true);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollViewContent: {
    paddingHorizontal: 10, // Adjust as needed to control overall horizontal padding
    paddingVertical: 20,
  },
});

export default UsageTermScreen;
