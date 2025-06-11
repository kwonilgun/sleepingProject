/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView, // <-- Add this
  Platform, // <-- Add this for platform-specific behavior
} from 'react-native';
import axios from 'axios';
import CustomCheckBox from '../../utils/CustomCheckBox';
import { baseURL } from '../../assets/common/BaseUrl';
import { PlaylistScreenProps } from '../model/types/TUserNavigator';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { convertEucKrToUtf8 } from '../../utils/converEucKrToUtf8';

interface PlaylistItem {
  id: string;
  name: string;
  title?: string;
  artist?: string;
  path: string;
  type: 'file' | 'folder';
  uri?: string;
  duration?: number;
  isSelected?: boolean;
  isDirectoryOpen?: boolean;
  children?: PlaylistItem[];
  depth?: number;
}

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playlistStructure, setPlaylistStructure] = useState<PlaylistItem[]>([]);
  const [flatDisplayList, setFlatDisplayList] = useState<PlaylistItem[]>([]);
  const [selectedTrackUris, setSelectedTrackUris] = useState<string[]>([]);
  const [areAllSelected, setAreAllSelected] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('PlaylistScreen is loading...');
    const fetchPlaylistStructure = async () => {
      try {
        const res = await axios.get<PlaylistItem[]>(`${baseURL}stream/playlist/db`);

        const initializeItems = (items: PlaylistItem[]): PlaylistItem[] => {
          return items.map(item => {
            const newItem = { ...item, isSelected: false, isDirectoryOpen: false };
            if (item.type === 'folder' && item.children) {
              newItem.children = initializeItems(item.children);
            }
            return newItem;
          });
        };

        console.log('Playlist res = ', res.data);
        const initialStructure = initializeItems(res.data);
        console.log('Playlist initialStructure = ', initialStructure);

        setPlaylistStructure(initialStructure);
        // Initial load: no search query, so it will respect isDirectoryOpen
        const result = updateFlatDisplayList(initialStructure, '', 0);
        setFlatDisplayList(result);
        setIsLoading(false);
      } catch (e) {
        console.error('Failed to fetch playlist structure:', e);
        setIsLoading(false);
        Alert.alert('오류', '재생 목록을 불러오지 못했습니다.');
      }
    };

    fetchPlaylistStructure();
  }, []);

  useEffect(() => {
    // `areAllSelected`는 현재 flatDisplayList에 표시되는 모든 파일이 선택되었는지 기준으로 판단합니다.
    const allPlayableTracksInDisplay: PlaylistItem[] = flatDisplayList.filter(item => item.type === 'file');
    const totalPlayableTracksInDisplayCount = allPlayableTracksInDisplay.length;

    // 현재 표시된 곡들의 URI를 수집
    const urisInDisplay = new Set(allPlayableTracksInDisplay.map(item => item.uri).filter(Boolean) as string[]);

    // selectedTrackUris가 현재 표시된 모든 곡을 포함하는지 확인
    const allDisplayTracksSelected = totalPlayableTracksInDisplayCount > 0 &&
      Array.from(urisInDisplay).every(uri => selectedTrackUris.includes(uri));

    setAreAllSelected(allDisplayTracksSelected);
  }, [flatDisplayList, selectedTrackUris]);

  // Effect for debouncing search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      // Pass the current playlistStructure and searchQuery
      setFlatDisplayList(updateFlatDisplayList(playlistStructure, searchQuery));
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, playlistStructure]); // Depend on playlistStructure too for full re-evaluation

  /**
   * 계층적 재생 목록 구조를 평탄화하여 FlatList 렌더링에 사용합니다.
   * isDirectoryOpen 상태를 고려하며, UI 들여쓰기를 위한 depth 속성을 추가합니다.
   * 또한, 검색어에 따라 목록을 필터링합니다.
   * @param {PlaylistItem[]} structure - 계층적 재생 목록 구조.
   * @param {string} currentSearchQuery - 현재 검색어.
   * @param {number} currentDepth - 현재 중첩 레벨 (들여쓰기용).
   * @returns {PlaylistItem[]} 평탄화된 목록.
   */
  const updateFlatDisplayList = (
    structure: PlaylistItem[],
    currentSearchQuery: string,
    currentDepth = 0,
  ): PlaylistItem[] => {
    let flattened: PlaylistItem[] = [];
    const lowerCaseSearchQuery = currentSearchQuery.toLowerCase();
    const hasSearchQuery = lowerCaseSearchQuery.length > 0; // 검색어가 있는지 여부 확인

    // console.log('lowerCaseSearchQuery = ', lowerCaseSearchQuery);
    // console.log('structure', structure);

    structure.forEach(item => {
      if (item) {
        const matchesSearch = (itemToMatch: PlaylistItem) => {
          if (!hasSearchQuery) return true; // 검색어가 없으면 모든 항목 매치

          // console.log('itemToMatch', itemToMatch);
          const nameMatch = itemToMatch.name?.toLowerCase().includes(lowerCaseSearchQuery);
          
          // console.log('itemToMatch.name (lowerCase):', itemToMatch.name?.toLowerCase());
          // console.log('lowerCaseSearchQuery:', lowerCaseSearchQuery);
          // console.log('nameMatch:', nameMatch);

          if (itemToMatch.type === 'file') {
            const titleMatch = itemToMatch.title
              ? itemToMatch.title.toLowerCase().includes(lowerCaseSearchQuery)
              : false;
            const artistMatch = itemToMatch.artist
              ? itemToMatch.artist.toLowerCase().includes(lowerCaseSearchQuery)
              : false;
            return nameMatch || titleMatch || artistMatch;
          }
          return nameMatch; // 폴더는 이름만 검색
        };

        const sortedChildren =
          item.type === 'folder' && item.children
            ? [...item.children].sort((a, b) => {
                if (a.type === 'folder' && b.type !== 'folder') return -1;
                if (a.type !== 'folder' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
              })
            : [];

        // 자식 항목 중 검색어와 일치하는 항목이 있는지 미리 확인
        // 이 로직은 `updateFlatDisplayList`가 재귀적으로 호출된 후 자식 항목이 반환되었을 때 정확히 작동합니다.
        const childMatches =
          item.type === 'folder'
            ? updateFlatDisplayList(sortedChildren, currentSearchQuery, currentDepth + 1)
            : [];

        // 현재 항목이 검색어에 일치하는지 여부
        const currentItemMatchesSearch = matchesSearch(item);

        // 표시할지 결정하는 조건:
        // 1. 현재 항목이 검색어에 일치하는 경우
        // 2. 검색어는 없지만, 폴더가 열려 있는 경우
        // 3. 검색어는 없지만, 자식 항목 중 매칭되는 것이 있는 경우 (이 경우는 `childMatches.length > 0`와 연결됨)
        // 4. 검색어가 있고, 자식 항목 중 매칭되는 것이 있는 경우 (이 경우 폴더를 "보여주기 위해" 포함시킴)
        const shouldIncludeItem = currentItemMatchesSearch || (item.type === 'folder' && childMatches.length > 0);


        if (shouldIncludeItem) {
          flattened.push({ ...item, depth: currentDepth });
        }


        // 자식 항목을 추가할지 결정하는 조건:
        // 1. 검색어가 없는 경우: 폴더가 isDirectoryOpen 상태인 경우에만 자식을 추가.
        // 2. 검색어가 있는 경우: 해당 폴더가 열려있거나, 자식 항목 중 매칭되는 것이 있다면 자식을 추가.
        //    (이는 검색어가 있는 경우 매칭되는 항목의 부모 폴더가 자동으로 "열린" 것처럼 보이게 합니다.)
        const shouldIncludeChildren =
          item.type === 'folder' &&
          ((!hasSearchQuery && item.isDirectoryOpen) || // 검색어가 없고 폴더가 열려있을 때
            (hasSearchQuery && (item.isDirectoryOpen || childMatches.length > 0))); // 검색어가 있고 (폴더가 열려있거나 자식 매칭이 있을 때)


        if (shouldIncludeChildren) {
          flattened = flattened.concat(childMatches);
        }
      }
    });

    return flattened;
  };


  /**
   * Toggles the `isSelected` state of a specific music file and updates selected tracks.
   * @param {string} id - The unique ID (path) of the track to toggle.
   * @param {boolean} newValue - The new selection state.
   */
  const toggleSelectTrack = (id: string, newValue: boolean) => {
    const updateRecursive = (items: PlaylistItem[]): PlaylistItem[] => {
      return items.map(item => {
        if (item.type === 'file' && item.id === id) {
          return { ...item, isSelected: newValue };
        }
        if (item.type === 'folder' && item.children) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };

    const updatedStructure = updateRecursive(playlistStructure);
    setPlaylistStructure(updatedStructure);

    const newSelectedUris: string[] = [];
    const collectSelectedUris = (items: PlaylistItem[]) => {
      items.forEach(item => {
        if (item.type === 'file' && item.isSelected && item.uri) {
          newSelectedUris.push(item.uri);
        } else if (item.type === 'folder' && item.children) {
          collectSelectedUris(item.children);
        }
      });
    };
    collectSelectedUris(updatedStructure);
    setSelectedTrackUris(newSelectedUris);

    // Pass the current searchQuery to updateFlatDisplayList
    setFlatDisplayList(updateFlatDisplayList(updatedStructure, searchQuery));
  };

  /**
   * Toggles the `isDirectoryOpen` state of a folder.
   * @param {string} folderId - The unique ID (path) of the folder.
   */
  const toggleFolder = (folderId: string) => {
    const toggleRecursive = (items: PlaylistItem[]): PlaylistItem[] => {
      return items.map(item => {
        if (item.id === folderId && item.type === 'folder') {
          return { ...item, isDirectoryOpen: !item.isDirectoryOpen };
        }
        if (item.type === 'folder' && item.children) {
          return { ...item, children: toggleRecursive(item.children) };
        }
        return item;
      });
    };
    const updatedStructure = toggleRecursive(playlistStructure);
    setPlaylistStructure(updatedStructure);
    // Pass the current searchQuery to updateFlatDisplayList
    setFlatDisplayList(updateFlatDisplayList(updatedStructure, searchQuery));
  };

  /**
   * Selects all playable tracks currently visible in the FlatList based on the search query.
   */
  const selectAllTracks = () => {
    // 현재 flatDisplayList에 표시되는 파일 항목만 필터링합니다.
    const filesToSelect = flatDisplayList.filter(item => item.type === 'file' && item.uri);
    const urisToSelect = new Set(filesToSelect.map(file => file.uri!)); // 중복 방지를 위해 Set 사용

    const updateRecursive = (items: PlaylistItem[]): PlaylistItem[] => {
      return items.map(item => {
        // 현재 표시되는 파일의 URI가 urisToSelect에 포함되어 있다면 선택
        if (item.type === 'file' && item.uri && urisToSelect.has(item.uri)) {
          return { ...item, isSelected: true };
        }
        // 그 외의 파일은 선택 해제 (이전 선택 상태를 초기화)
        if (item.type === 'file' && item.uri && !urisToSelect.has(item.uri)) {
          return { ...item, isSelected: false };
        }
        if (item.type === 'folder' && item.children) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };

    const updatedStructure = updateRecursive(playlistStructure);
    setPlaylistStructure(updatedStructure);

    // 새롭게 선택된 URI 목록을 flatDisplayList에서 재구성
    const newSelectedUris: string[] = [];
    const collectSelectedUris = (items: PlaylistItem[]) => {
      items.forEach(item => {
        if (item.type === 'file' && item.isSelected && item.uri) {
          newSelectedUris.push(item.uri);
        } else if (item.type === 'folder' && item.children) {
          collectSelectedUris(item.children);
        }
      });
    };
    collectSelectedUris(updatedStructure);
    setSelectedTrackUris(newSelectedUris);

    // 변경된 구조를 바탕으로 화면을 업데이트 (검색어 유지)
    setFlatDisplayList(updateFlatDisplayList(updatedStructure, searchQuery));
  };

  /**
   * Deselects all currently selected tracks.
   */
  const deselectAllTracks = () => {
    const updateRecursive = (items: PlaylistItem[]): PlaylistItem[] => {
      return items.map(item => {
        if (item.type === 'file') {
          return { ...item, isSelected: false };
        }
        if (item.type === 'folder' && item.children) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };
    const updatedStructure = updateRecursive(playlistStructure);
    setPlaylistStructure(updatedStructure);
    setSelectedTrackUris([]);
    // Pass the current searchQuery to updateFlatDisplayList
    setFlatDisplayList(updateFlatDisplayList(updatedStructure, searchQuery));
  };

  /**
   * Handles playing the selected tracks. Navigates to `PlayerScreen`.
   */
  const handlePlaySelected = () => {
    if (selectedTrackUris.length === 0) {
      Alert.alert('재생할 곡을 선택해주세요.');
      return;
    }

    const fullPlayableFilesForPlayer: PlaylistItem[] = [];
    const collectAllFilesForPlayer = (items: PlaylistItem[]) => {
      items.forEach(item => {
        if (item.type === 'file' && item.uri) {
          fullPlayableFilesForPlayer.push(item);
        } else if (item.type === 'folder' && item.children) {
          collectAllFilesForPlayer(item.children);
        }
      });
    };
    collectAllFilesForPlayer(playlistStructure);

    navigation.navigate('PlayerScreen', {
      selectedTracks: selectedTrackUris,
      playlist: fullPlayableFilesForPlayer,
    });
  };

  /**
   * Renders a single item in the FlatList, distinguishing between files and folders.
   * @param {Object} - Destructured item and index from FlatList.
   */
  const renderPlaylistItem = ({ item }: { item: PlaylistItem }) => {
    const indentation = item.depth ? item.depth * 20 : 0;

    const displayLabel =
    item.type === 'file' && item.name
      ? item.name.replace(/\.mp3$/i, '')  // .mp3 확장자 제거 (대소문자 구분 없이)
      : item.name;

    if (item.type === 'folder') {
      return (
        <TouchableOpacity
          style={[styles.folderItemContainer, { paddingLeft: 10 + indentation }]}
          onPress={() => toggleFolder(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.folderItemText}>
            {item.isDirectoryOpen ? '📂' : '📁'} {displayLabel}
          </Text>
        </TouchableOpacity>
      );
    } else {
      // type === 'file'
      // const artistText = item.artist ? ` - ${item.artist}` : '';
      const artistText = '';
      return (
        <View style={[styles.playlistItemContainer, { paddingLeft: 10 + indentation }]}>
          <CustomCheckBox
            value={item.isSelected!}
            onValueChange={newValue => toggleSelectTrack(item.id, newValue)}
          />
          <Text style={styles.playlistItemText} numberOfLines={1}>
            {displayLabel}
            {artistText}
          </Text>
        </View>
      );
    }
  };

  // --- UI Rendering based on Loading/Empty State ---
  if (isLoading) {
    return (
      <WrapperContainer containerStyle={{ paddingHorizontal: 0 }}>
        <HeaderComponent
          rightPressActive={false}
          isCenterView={false}
          centerText=""
          rightText={''}
          isRightView={false}
        />
        <View style={styles.container}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </WrapperContainer>
    );
  }

  if (playlistStructure.length === 0) {
    return (
      <WrapperContainer containerStyle={{ paddingHorizontal: 0 }}>
        <HeaderComponent
          rightPressActive={false}
          isCenterView={false}
          centerText=""
          rightText={''}
          isRightView={false}
        />
        <View style={styles.container}>
          <Text style={styles.emptyListText}>재생 목록이 없습니다.</Text>
        </View>
      </WrapperContainer>
    );
  }

  // --- Header Right Component (Language Selector) ---
  const onPressRight = () => {
    Alert.alert('언어 선택', '언어 선택 기능을 구현할 수 있습니다.');
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
            borderRadius: RFPercentage(5) / 2,
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

  // --- Main Render ---
  return (
    <WrapperContainer containerStyle={{ paddingHorizontal: 0 }}>
      <HeaderComponent
        rightPressActive={true}
        isCenterView={false}
        centerText=""
        rightText={''}
        isRightView={false}
        rightCustomView={RightCustomComponent}
      />
      <KeyboardAvoidingView // <-- Start KeyboardAvoidingView
        style={{ flex: 1 }} // It needs to have a flex to take up available space
        behavior={Platform.OS === 'ios' ? 'height' : 'height'} // 'height' or 'position' might work for Android
        keyboardVerticalOffset={Platform.OS === 'ios' ? RFPercentage(1) : 0} // Adjust this value as needed to fine-tune the offset
      >
        <View style={styles.container}>
          <Text style={styles.playlistTitle}>🎶 음악 라이브러리</Text>

          {/* Search Input */}
          <TextInput
            style={styles.searchInput}
            placeholder="음악 검색..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.selectionButtonsContainer}>
            <Button
              title="모두 선택"
              onPress={selectAllTracks}
              color="#007bff"
              disabled={
                areAllSelected || flatDisplayList.filter(item => item.type === 'file').length === 0
              }
            />
            <View style={{ width: 10 }} />
            <Button
              title="모두 해제"
              onPress={deselectAllTracks}
              color="#dc3545"
              disabled={selectedTrackUris.length === 0}
            />
          </View>
          <FlatList
            data={flatDisplayList}
            keyExtractor={item => item.id}
            renderItem={renderPlaylistItem}
            style={styles.flatList}
            contentContainerStyle={styles.flatListContent}
          />
          <View style={styles.buttonContainer}>
            <Button
              title={`선택된 곡 재생 (${selectedTrackUris.length})`}
              onPress={handlePlaySelected}
              color="#1FB28A"
              disabled={selectedTrackUris.length === 0}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

    </WrapperContainer>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  emptyListText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  playlistTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
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
    paddingRight: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  playlistItemText: {
    marginLeft: RFPercentage(1),
    fontSize: RFPercentage(1.3),
    flex: 1,
    flexShrink: 1,
    color: '#444',
  },
  folderItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#e9e9e9',
    borderRadius: 8,
    marginBottom: 8,
    paddingRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  folderItemText: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    marginTop: RFPercentage(2),
    paddingBottom: RFPercentage(1),
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: RFPercentage(1),
  },
  selectionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
});

export default PlaylistScreen;