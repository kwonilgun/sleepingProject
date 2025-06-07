/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useState} from 'react';
import {ScrollView, TouchableOpacity, StyleSheet, View} from 'react-native';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import strings from '../../constants/lang';
import {UsageTermScreenProps} from '../../Screens/model/types/TUserNavigator';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {baseURL} from '../../assets/common/BaseUrl';
import {
  OZS_USAGE_TERM_EN_ID,
  OZS_USAGE_TERM_ID,
  width,
} from '../../assets/common/BaseValue';
import {errorAlert} from '../../utils/alerts/errorAlert';
import RenderHTML  from 'react-native-render-html';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import {useLanguage} from '../../context/store/LanguageContext';
import colors from '../../styles/colors';
import {RFPercentage} from 'react-native-responsive-fontsize';


const renderersProps = {
  a: {
    onPress: (event: any, href: any) => {
      console.log('링크 클릭됨:', href);
    },
  },
};

const tagsStyles = {
  body: { color: colors.black, fontSize: RFPercentage(2) },
};

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
        <View style={{flex: 1}}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{flexGrow: 1}}>
            <RenderHTML
              contentWidth={width}
              source={{ html: contents || '' }}
              renderersProps={renderersProps}
              tagsStyles={tagsStyles}
            />
          </ScrollView>
        </View>
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
      response = await axios.get(`${baseURL}terms/${OZS_USAGE_TERM_ID}`);
    } else {
      response = await axios.get(`${baseURL}terms/${OZS_USAGE_TERM_EN_ID}`);
    }
    if (response.status === 200) {
      const location = response.data[0]?.usageLocation.split('/').pop();
      if (!location) {
        throw new Error('Invalid usage location');
      }

      const res = await axios.get(`${baseURL}terms/downloadtext/${location}`);
      if (res.status === 200) {
        console.log('이용약관을  서버에서 성공적으로 가져옴');
        setContents(res.data);
      } else {
        setContents('UsageTerms.tsx: 데이터를 가져오지 못했습니다.');
      }
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
  scrollView: {
    backgroundColor: 'white',
    // marginHorizontal: 20,
  },
});

export default UsageTermScreen;
