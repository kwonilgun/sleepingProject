/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert, // React Native's Alert for user notifications
  ActivityIndicator, // For loading indicator
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../../styles/colors';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteScreenProps } from '../model/types/TUserNavigator';
import { useFocusEffect } from '@react-navigation/native';
import isEmpty from '../../utils/isEmpty';
import { baseURL } from '../../assets/common/BaseUrl';
import { getToken } from '../../utils/getSaveToken';
import axios, { AxiosResponse } from 'axios';
import { alertMsg } from '../../utils/alerts/alertMsg';

interface PlaylistItem {
  id: string;
  name: string;
  title?: string;
  artist?: string;
  path: string;
  type: 'file' | 'folder'; // Will always be 'file' for favorites
  uri?: string;
  duration?: number;
  isFavorite?: boolean;
}

const FAVORITE_TRACKS_KEY = '@favoriteTracks'; // Same key as in PlaylistScreen

const FavoriteScreen: React.FC<FavoriteScreenProps> = ({ navigation, route }) => {

  // route.params가 undefined일 경우, 빈 객체 {}를 기본값으로 사용
  const { favoritedTracks = [] } = route.params || {};

  const [favoriteTracks, setFavoriteTracks] = useState<PlaylistItem[] | undefined>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 로딩 상태 추가

  useFocusEffect(
    useCallback(() => {
      async function fetchTracks() {
        setIsLoading(true); // 로딩 시작
        console.log('Favorite useCallback favoriteTracks', favoriteTracks);
        let tracksToSet: PlaylistItem[] | undefined;
        if (favoritedTracks && favoritedTracks.length > 0) {
          tracksToSet = favoritedTracks;
        } else {
          // Fallback: If no tracks are passed, try to load from AsyncStorage
          tracksToSet = await loadFavoriteTracksFromStorage();
          console.log('result from storage : ', tracksToSet);
        }
        setFavoriteTracks(tracksToSet);
        setIsLoading(false); // 로딩 종료
      }
      fetchTracks();
    }, []), // route.params.favoritedTracks에 따라 데이터 다시 불러오기
  );


  const loadFavoriteTracksFromStorage = async (): Promise<PlaylistItem[] | undefined> => {
    try {
      const storedFavoritesUris = await AsyncStorage.getItem(FAVORITE_TRACKS_KEY);

      console.log('storedFavoritesUris', storedFavoritesUris);

      if (!storedFavoritesUris) {
        console.log('No favorite tracks found in storage.');
        return []; // 가져올 URI가 없으면 빈 배열 반환
      }

      const uris = JSON.parse(storedFavoritesUris) as string[];

      if (uris.length === 0) {
        console.log('Stored favorite URIs list is empty.');
        return []; // URI 목록이 비어있으면 빈 배열 반환
      }

      const token = await getToken();
      // 헤더 정보를 만든다.
      const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      };

      // 서버 요청 추가
      try {
        const response: AxiosResponse = await axios.post(`${baseURL}stream/by-uris`,
          JSON.stringify({ uris }), // URI 배열 전송
          config,
        );
        if (response.status === 200 || response.status === 201) {
          console.log('Successfully loaded favorite tracks from server:', response.data);
          // 가져온 모든 트랙을 즐겨찾기로 표시
          return response.data.map((track: PlaylistItem) => ({ ...track, isFavorite: true }));
        }
        else {
          alertMsg('에러', String(response.status));
          return [];
        }
      } catch (networkError) {
        console.error('Network error fetching favorite tracks:', networkError);
        Alert.alert('네트워크 오류', '즐겨찾는 곡을 로드하기 위해 서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
        return [];
      }

    } catch (error) {
      console.error('Error loading favorite tracks from storage or parsing:', error);
      Alert.alert('오류', '로컬 저장소에서 즐겨찾는 곡을 로드하는 데 실패했습니다. 데이터가 손상되었을 수 있습니다.');
      return [];
    }
  };


  const removeFavorite = async (id: string) => {
    const updatedFavorites = favoriteTracks?.filter(track => track.id !== id);
    setFavoriteTracks(updatedFavorites);

    // 제거를 반영하기 위해 AsyncStorage도 업데이트
    const updatedUris = updatedFavorites?.map(track => track.uri!).filter(Boolean) as string[];
    try {
      await AsyncStorage.setItem(FAVORITE_TRACKS_KEY, JSON.stringify(updatedUris));
      Alert.alert('즐겨찾기 해제', '선택한 곡이 즐겨찾기에서 해제되었습니다.');
    } catch (error) {
      console.error('Error removing favorite from storage:', error);
    }
  };

  const handlePlayFavorite = (trackUri: string) => {
    // 플레이어에 전달할 전체 트랙 객체 찾기
    const trackToPlay = favoriteTracks?.find(track => track.uri === trackUri);
    if (trackToPlay) {
      navigation.navigate('Player', {
        screen: 'PlayerScreen',
        params: {
          selectedTracks: [trackToPlay.uri!], // 선택한 즐겨찾기 트랙만 재생
          playlist: favoriteTracks ? favoriteTracks : [], // 모든 즐겨찾기를 재생 목록으로 전달할 수 있습니다.
        }
      });
    } else {
      Alert.alert('오류', '선택한 곡을 재생할 수 없습니다.');
    }
  };

  // 모든 즐겨찾기 곡을 재생하는 함수
  const handlePlayAllFavorites = () => {
    if (!favoriteTracks || favoriteTracks.length === 0) {
      Alert.alert('재생할 곡 없음', '즐겨찾는 곡이 없습니다.');
      return;
    }

    const allTrackUris = favoriteTracks.map(track => track.uri!).filter(Boolean) as string[];

    if (allTrackUris.length > 0) {
      navigation.navigate('Player', {
        screen: 'PlayerScreen',
        params: {
          selectedTracks: allTrackUris, // 모든 URI를 재생 목록으로 전달
          playlist: favoriteTracks, // 전체 목록을 재생 목록으로 전달
        }
      });
    } else {
      Alert.alert('오류', '재생할 수 있는 즐겨찾는 곡이 없습니다.');
    }
  };


  const renderFavoriteItem = ({ item }: { item: PlaylistItem }) => {
    return (
      <View style={styles.favoriteItemContainer}>
        <TouchableOpacity onPress={() => handlePlayFavorite(item.uri!)} style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={1}>
            {item.name.replace(/\.mp3$/i, '')}
          </Text>
          {item.artist && <Text style={styles.trackArtist}>{item.artist}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.removeButton}>
          <FontAwesome name="trash" size={RFPercentage(2.5)} color={colors.blue} />
        </TouchableOpacity>
      </View>
    );
  };

  const goBackToPlaylist = () => {
    navigation.goBack();
  };

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={goBackToPlaylist}>
        <FontAwesome
          style={{
            height: RFPercentage(8),
            width: RFPercentage(10),
            marginTop: RFPercentage(2),
            color: colors.black,
            fontSize: RFPercentage(5),
            fontWeight: 'bold',
          }}
          name="arrow-left"
        />
      </TouchableOpacity>
    );
  };

  return (
    <WrapperContainer containerStyle={{ paddingHorizontal: 0 }}>
      <HeaderComponent
        isLeftView={false}
        leftCustomView={LeftCustomComponent}
        rightPressActive={false}
        isCenterView={false}
        centerText="⭐ 즐겨찾기"
        isRightView={false}
      />
      <View style={styles.container}>
        {isLoading ? ( // 로딩 중일 때 로딩 인디케이터 표시
          <ActivityIndicator size="large" color={colors.blue} style={styles.loadingIndicator} />
        ) : favoriteTracks?.length === 0 ? (
          <Text style={styles.emptyListText}>즐겨찾는 곡이 없습니다.</Text>
        ) : (
          <FlatList
            data={favoriteTracks}
            keyExtractor={item => item.id}
            renderItem={renderFavoriteItem}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>

      {/* 모든 즐겨찾기 재생 버튼 */}
      {!isLoading && favoriteTracks && favoriteTracks.length > 0 && (
        <TouchableOpacity
          style={styles.playAllButton}
          onPress={handlePlayAllFavorites}
        >
          <FontAwesome name="play" size={RFPercentage(3)} color={colors.white} style={styles.playIcon} />
          <Text style={styles.playAllButtonText}>모든 즐겨찾기 재생</Text>
        </TouchableOpacity>
      )}
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.lightGrey,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  favoriteItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.white, // 배경색 추가하여 가시성 향상
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2, // Android 그림자
    shadowColor: '#000', // iOS 그림자
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  trackInfo: {
    flex: 1,
    marginRight: 10,
  },
  trackName: {
    fontSize: RFPercentage(1.8),
    fontWeight: 'bold',
    color: '#333',
  },
  trackArtist: {
    fontSize: RFPercentage(1.5),
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 5,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue, // 버튼의 눈에 띄는 색상
    paddingVertical: 15,
    borderRadius: 30, // 둥글게 만들기
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playAllButtonText: {
    color: colors.white,
    fontSize: RFPercentage(2.2),
    fontWeight: 'bold',
    marginLeft: 10, // 아이콘과 텍스트 사이의 공간
  },
  playIcon: {
    // 컴포넌트에 이미 크기와 색상이 설정되어 있음 (명확성을 위해 여기에 추가)
  }
});

export default FavoriteScreen;
