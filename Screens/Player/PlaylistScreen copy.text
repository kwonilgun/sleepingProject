/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import CustomCheckBox from '../../utils/CustomCheckBox'; // Assuming CustomCheckBox is in the same directory
import { baseURL } from '../../assets/common/BaseUrl';
import { PlaylistScreenProps } from '../model/types/TUserNavigator';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { convertEucKrToUtf8 } from '../../utils/converEucKrToUtf8';


interface PlaylistItem {
  id: string;
  title: string;
  uri: string;
  isSelected?: boolean;
}

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  // New state to track if all tracks are selected
  const [areAllSelected, setAreAllSelected] = useState<boolean>(false);

  useEffect(() => {
    console.log('PlaylistScreen...');
    const fetchPlaylist = async () => {
      try {
        const res = await axios.get<PlaylistItem[]>(`${baseURL}stream/playlist`);
        const initialPlaylist = res.data.map(item => ({ ...item, isSelected: false }));
        setPlaylist(initialPlaylist);
        setIsLoading(false);
      } catch (e) {
        console.error('플레이리스트 가져오기 실패', e);
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, []);

  // Effect to update areAllSelected when playlist or selectedTracks change
  useEffect(() => {
    setAreAllSelected(playlist.length > 0 && selectedTracks.length === playlist.length);
  }, [playlist, selectedTracks]);

  const toggleSelectTrack = (id: string, newValue: boolean) => {
    const updatedPlaylist = playlist.map(item =>
      item.id === id ? { ...item, isSelected: newValue } : item
    );
    setPlaylist(updatedPlaylist);

    const updatedSelectedTracks = updatedPlaylist
      .filter(item => item.isSelected)
      .map(item => item.id);
    setSelectedTracks(updatedSelectedTracks);
  };

  const handlePlaySelected = () => {
    if (selectedTracks.length === 0) {
      Alert.alert('재생할 곡을 선택해주세요.');
      return;
    }
    navigation.navigate('PlayerScreen', { selectedTracks: selectedTracks, playlist: playlist });
  };

  // Function to select all tracks
  const selectAllTracks = () => {
    const updatedPlaylist = playlist.map(item => ({ ...item, isSelected: true }));
    setPlaylist(updatedPlaylist);
    setSelectedTracks(updatedPlaylist.map(item => item.id));
  };

  // Function to deselect all tracks
  const deselectAllTracks = () => {
    const updatedPlaylist = playlist.map(item => ({ ...item, isSelected: false }));
    setPlaylist(updatedPlaylist);
    setSelectedTracks([]);
  };

  const renderPlaylistItem = ({ item }: { item: PlaylistItem }) => {
    // item.title이 EUC-KR이라고 가정하고 변환
    const displayTitle = item.title ? convertEucKrToUtf8(item.title) : item.uri;

    return (
      <View style={styles.playlistItemContainer}>
          <CustomCheckBox
            value={item.isSelected!}
            onValueChange={(newValue) => toggleSelectTrack(item.id, newValue)}
          />
          <Text style={styles.playlistItemText}>{displayTitle}</Text>
        </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  if (playlist.length === 0) {
    return (
      <View style={styles.container}>
        <Text>재생 목록이 없습니다.</Text>
      </View>
    );
  }

  const onPressRight = () => {
    console.log('Login.Screen right  click');
    // selectLanguage();
  };

  const RightCustomComponent = () => {
      return (
        <TouchableOpacity onPress={onPressRight}>
        <View
          style={{
            width: RFPercentage(5),
            height: RFPercentage(5),
            borderColor: 'black',
            borderWidth: 2,
            borderRadius: RFPercentage(5) / 2, // 원형
            // backgroundColor: 'blue', // 배경색
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: RFPercentage(2), color: 'black', fontWeight: 'bold' }}>
            한/A
          </Text>
        </View>
      </TouchableOpacity>
      );
    };

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        isCenterView={false}
        centerText= ""
        // centerCustomView={CenterCustomComponent}
        rightText={''}
        // rightTextStyle={{color: colors.lightBlue}}
        // onPressRight={() => {}}
        isRightView={false}
        rightCustomView={RightCustomComponent}
      />

      <View style={styles.container}>
        <Text style={styles.playlistTitle}>🎶 재생 목록 (선택 후 재생)</Text>
        <View style={styles.selectionButtonsContainer}>
          <Button
            title="모두 선택"
            onPress={selectAllTracks}
            color="#007bff"
            disabled={areAllSelected || playlist.length === 0}
          />
          <View style={{ width: 10 }} /> {/* Spacer */}
          <Button
            title="모두 해제"
            onPress={deselectAllTracks}
            color="#dc3545"
            disabled={selectedTracks.length === 0}
          />
        </View>
        <FlatList
          data={playlist}
          keyExtractor={(item) => item.id}
          renderItem={renderPlaylistItem}
          style={styles.flatList}
        />
        <View style={styles.buttonContainer}>
          <Button
            title={`선택된 곡 재생 (${selectedTracks.length})`}
            onPress={handlePlaySelected}
            color="#1FB28A"
            disabled={selectedTracks.length === 0}
          />
        </View>
      </View>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  playlistTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  flatList: {
    flex: 1,
  },
  playlistItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  playlistItemText: {
    marginLeft: 15,
    fontSize: 16,
    flexShrink: 1,
    color: '#444',
  },
  buttonContainer: {
    marginTop: 20,
    paddingBottom: 10,
  },
  selectionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
});

export default PlaylistScreen;