/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable comma-dangle */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../../styles/colors';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  State,
  usePlaybackState,
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage for persistence
import { useFocusEffect } from '@react-navigation/native';
import { width } from '../../styles/responsiveSize';



// import { convertEucKrToUtf8 } from '../../utils/converEucKrToUtf8';

export interface PlaylistItem {
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
  isFavorite?: boolean; // Add isFavorite property
}

const FAVORITE_TRACKS_KEY = '@favoriteTracks'; // Key for AsyncStorage
const SELECTED_TRACKS_KEY = '@selectedTracks'; // New Key for AsyncStorage

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({ navigation }) => {
  const playbackState = usePlaybackState();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playlistStructure, setPlaylistStructure] = useState<PlaylistItem[]>([]);
  const [flatDisplayList, setFlatDisplayList] = useState<PlaylistItem[]>([]);
  const [selectedTrackUris, setSelectedTrackUris] = useState<string[]>([]);
  const [areAllSelected, setAreAllSelected] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // New state for managing favorite track URIs
  const [favoriteTrackUris, setFavoriteTrackUris] = useState<string[]>([]);

  /**
   * Persists track URIs to AsyncStorage for a given key.
   * @param {string} key - The AsyncStorage key.
   * @param {string[]} uris - The array of URIs to save.
   */
  const saveTracksToStorage = async (key: string, uris: string[]) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(uris));
      console.log(`${key} tracks saved successfully.`);
    } catch (error) {
      console.error(`Error saving ${key} tracks:`, error);
    }
  };

  /**
   * Loads track URIs from AsyncStorage for a given key.
   * @param {string} key - The AsyncStorage key.
   * @returns {Promise<string[]>} The array of URIs.
   */
  const loadTracksFromStorage = async (key: string): Promise<string[]> => {
    try {
      const storedData = await AsyncStorage.getItem(key);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error(`Error loading ${key} tracks:`, error);
      return [];
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('PlaylistScreen is loading...');
      const fetchPlaylistStructureAndFavorites = async () => {
        try {
          setIsLoading(true);
          // Fetch playlist structure
          const res = await axios.get<PlaylistItem[]>(`${baseURL}stream/playlist/db`);

          // Fetch favorite tracks from AsyncStorage
          const storedFavorites = await loadTracksFromStorage(FAVORITE_TRACKS_KEY);
          setFavoriteTrackUris(storedFavorites);

          // Fetch selected tracks from AsyncStorage
          const storedSelected = await loadTracksFromStorage(SELECTED_TRACKS_KEY);
          setSelectedTrackUris(storedSelected); // Set the selected tracks state

          const initializeItems = (items: PlaylistItem[]): PlaylistItem[] => {
            return items.map(item => {
              const newItem = {
                ...item,
                isSelected: item.type === 'file' && item.uri ? storedSelected.includes(item.uri) : false, // Set isSelected based on stored data
                isDirectoryOpen: false,
                isFavorite: item.type === 'file' && item.uri ? storedFavorites.includes(item.uri) : false, // Set isFavorite based on stored data
              };
              if (item.type === 'folder' && item.children) {
                newItem.children = initializeItems(item.children);
              }
              return newItem;
            });
          };

          const initialStructure = initializeItems(res.data);
          setPlaylistStructure(initialStructure);

          const result = updateFlatDisplayList(initialStructure, '', 0);
          setFlatDisplayList(result);
        } catch (e) {
          console.error('Failed to fetch playlist structure or favorites:', e);
          Alert.alert('오류', '재생 목록 또는 즐겨찾기를 불러오지 못했습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchPlaylistStructureAndFavorites();
    }, []),
  );

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
      // console.log('PlayListScreen useEffect playlistStructure, searchQuery', playlistStructure, searchQuery);
      setFlatDisplayList(updateFlatDisplayList(playlistStructure, searchQuery));
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, playlistStructure]);

  /**
   * Toggles the favorite status of a specific music file.
   * @param {string} id - The unique ID (path) of the track to toggle.
   */
  const toggleFavoriteTrack = (id: string) => {
    const updateRecursive = (items: PlaylistItem[]): PlaylistItem[] => {
      return items.map(item => {
        if (item.type === 'file' && item.id === id) {
          const newFavoriteStatus = !item.isFavorite;
          // Update favoriteTrackUris state
          setFavoriteTrackUris(prevUris => {
            const updatedUris = newFavoriteStatus
              ? [...prevUris, item.uri!] // Add URI if favoriting
              : prevUris.filter(uri => uri !== item.uri); // Remove URI if unfavoriting
            saveTracksToStorage(FAVORITE_TRACKS_KEY, updatedUris); // Persist updated favorites
            return updatedUris;
          });
          return { ...item, isFavorite: newFavoriteStatus };
        }
        if (item.type === 'folder' && item.children) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };

    const updatedStructure = updateRecursive(playlistStructure);
    setPlaylistStructure(updatedStructure);
    setFlatDisplayList(updateFlatDisplayList(updatedStructure, searchQuery));
  };

//   function compareStrings(str1: string, str2: string): void {
//     console.log(`'${str1}'의 길이: ${str1.length}`);
//     console.log(`'${str2}'의 길이: ${str2.length}`);

//     console.log('str1의 유니코드 값:');
//     for (const char of str1) {
//         console.log(`  '${char}': U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
//     }

//     console.log('str2의 유니코드 값:');
//     for (const char of str2) {
//         console.log(`  '${char}': U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
//     }

//     // 유니코드 정규화를 통한 비교
//     // JavaScript/TypeScript의 내장 기능인 String.prototype.normalize() 사용
//     const normalizedStr1 = str1.normalize('NFC'); // 또는 'NFD', 'NFKC', 'NFKD'
//     const normalizedStr2 = str2.normalize('NFC');

//     console.log(`\n정규화 후 str1: '${normalizedStr1}'`);
//     console.log(`정규화 후 str2: '${normalizedStr2}'`);
//     console.log(`정규화 후 비교 결과: ${normalizedStr1 === normalizedStr2}`);
// }



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
    const hasSearchQuery = lowerCaseSearchQuery.length > 0;

    structure.forEach(item => {
      if (item) {
        const matchesSearch = (itemToMatch: PlaylistItem) => {
          if (!hasSearchQuery) return true;

          // 한글의 경우: 조합형 한글 (초성 + 중성 + 종성)을 완성형 한글 (하나의 코드 포인트)로 변환합니다. 예를 들어, str.normalize('NFC')를 사용하면 'ㄱㅏ'가 '가'로 변환됩니다. (실제로 한글은 완성형 코드 포인트가 이미 존재하므로 normalize()를 통해 조합형을 완성형으로 변환하는 방식은 잘 사용되지 않지만, 다른 언어의 경우에는 유용합니다.)


          const nameMatch = itemToMatch.name?.normalize('NFC').toLowerCase().includes(lowerCaseSearchQuery);

          // console.log('nameMatch, lowerCaseSearchQuery, itemToMatch.type', nameMatch, lowerCaseSearchQuery, itemToMatch.type);


          if (itemToMatch.type === 'file') {
            // console.log('itemToMatch.name:', itemToMatch.name);
            // console.log('lowerCaseSearchQuery:', lowerCaseSearchQuery);

            const titleMatch = itemToMatch.name
                          ? itemToMatch.name.normalize('NFC').toLowerCase().trim().includes(lowerCaseSearchQuery)
                          : false;
            // console.log('titleMatch:', titleMatch);
            const artistMatch = itemToMatch.artist
              ? itemToMatch.artist.normalize('NFC').toLowerCase().includes(lowerCaseSearchQuery)
              : false;

            // console.log('itemToMatch.title, itemToMatch.artitst', itemToMatch.title, itemToMatch.artist);
            return nameMatch || titleMatch || artistMatch;
          }
          return nameMatch;
        };

        const sortedChildren =
          item.type === 'folder' && item.children
            ? [...item.children].sort((a, b) => {
                if (a.type === 'folder' && b.type !== 'folder') return -1;
                if (a.type !== 'folder' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
              })
            : [];

        const childMatches =
          item.type === 'folder'
            ? updateFlatDisplayList(sortedChildren, currentSearchQuery, currentDepth + 1)
            : [];

        const currentItemMatchesSearch = matchesSearch(item);

        const shouldIncludeItem = currentItemMatchesSearch || (item.type === 'folder' && childMatches.length > 0);

        if (shouldIncludeItem) {
          flattened.push({ ...item, depth: currentDepth });
        }

        const shouldIncludeChildren =
          item.type === 'folder' &&
          ((!hasSearchQuery && item.isDirectoryOpen) ||
            (hasSearchQuery && (item.isDirectoryOpen || childMatches.length > 0)));

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
    saveTracksToStorage(SELECTED_TRACKS_KEY, newSelectedUris); // Persist selected tracks

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
    setFlatDisplayList(updateFlatDisplayList(updatedStructure, searchQuery));
  };

  /**
   * Selects all playable tracks currently visible in the FlatList based on the search query.
   */
  const selectAllTracks = () => {
    const filesToSelect = flatDisplayList.filter(item => item.type === 'file' && item.uri);
    const urisToSelect = new Set(filesToSelect.map(file => file.uri!));

    const updateRecursive = (items: PlaylistItem[]): PlaylistItem[] => {
      return items.map(item => {
        if (item.type === 'file' && item.uri && urisToSelect.has(item.uri)) {
          return { ...item, isSelected: true };
        }
        if (item.type === 'file' && item.uri && !urisToSelect.has(item.uri)) {
          return { ...item, isSelected: false }; // Deselect tracks not in the current display list
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
    saveTracksToStorage(SELECTED_TRACKS_KEY, newSelectedUris); // Persist selected tracks

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
    saveTracksToStorage(SELECTED_TRACKS_KEY, []); // Clear selected tracks from storage
    setFlatDisplayList(updateFlatDisplayList(updatedStructure, searchQuery));
  };

  /**
   * Renders a single item in the FlatList, distinguishing between files and folders.
   * @param {Object} - Destructured item and index from FlatList.
   */
  const renderPlaylistItem = ({ item }: { item: PlaylistItem }) => {
    const indentation = item.depth ? item.depth * 20 : 0;

    const displayLabel =
      item.type === 'file' && item.name
        ? item.name.replace(/\.mp3$/i, '')
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
      return (
        <View style={[styles.playlistItemContainer, { paddingLeft: 10 + indentation }]}>
          <CustomCheckBox
            value={item.isSelected!}
            onValueChange={newValue => toggleSelectTrack(item.id, newValue)}
          />
          <Text style={styles.playlistItemText} numberOfLines={1}>
            {displayLabel}
          </Text>
          <TouchableOpacity
            onPress={() => toggleFavoriteTrack(item.id)}
            style={styles.favoriteButton}
          >
            <FontAwesome
              name={item.isFavorite ? 'star' : 'star-o'}
              size={RFPercentage(3.5)}
              color={item.isFavorite ? colors.lightBlue : colors.grey}
            />
          </TouchableOpacity>
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

  /**
   * Handles playing the selected tracks. Navigates to `PlayerScreen`.
   */
  const handlePlaySelected = () => {
    if (selectedTrackUris.length === 0 && playbackState.state !== State.Playing) {
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

    navigation.navigate('Player', {
      screen: 'PlayerScreen',
      params: {
        selectedTracks: selectedTrackUris,
        playlist: fullPlayableFilesForPlayer,
      }
    });
  };

  const goBackToPlayer = () => {
    navigation.goBack(); // Navigate back to the previous screen (presumably the Player)
  };

  const navigateToFavorites = () => {
    // We need to pass the actual favorite PlaylistItem objects to the FavoriteScreen
    // so it can render details and play them.
    const allFiles: PlaylistItem[] = [];
    const collectAllFiles = (items: PlaylistItem[]) => {
        items.forEach(item => {
            if (item.type === 'file') {
                allFiles.push(item);
            } else if (item.type === 'folder' && item.children) {
                collectAllFiles(item.children);
            }
        });
    };
    collectAllFiles(playlistStructure);

    // Filter all files to get only the favorited ones
    const favoritedFiles = allFiles.filter(file => favoriteTrackUris.includes(file.uri!));

    navigation.navigate('Favorite', {
      screen: 'FavoriteScreen', // Assuming 'FavoriteScreen' is a screen within your 'Player' navigator
      params: {
        favoritedTracks: favoritedFiles,
      },
    });
  };

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={goBackToPlayer}>
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

  const RightCustomComponent = () => {
    return (
      <TouchableOpacity onPress={navigateToFavorites}>
        <FontAwesome
          name="star"
          size={RFPercentage(3.5)}
          color= {colors.lightBlue}
          style={{ marginRight: 10, marginTop: RFPercentage(2) }}
        />
      </TouchableOpacity>
    );
  };

  // --- Main Render ---
  return (
    <WrapperContainer containerStyle={{ paddingHorizontal: 0 }}>
      <HeaderComponent
        isLeftView={false}
        leftCustomView={LeftCustomComponent}
        rightPressActive={false}
        isCenterView={false}
        centerText="🎶라이브러리"
        isRight = {false}
        isRightView={false}
        rightCustomView={RightCustomComponent} // Add the new RightCustomComponent
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Changed to 'padding' for better iOS behavior with TextInput
        keyboardVerticalOffset={Platform.OS === 'ios' ? RFPercentage(1) : 0}
      >
        <View style={styles.container}>
          {/* Search Input */}
          <TextInput
            style={styles.searchInput}
            placeholder="음악 검색..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.selectionButtonsContainer}>
            {/* 모두 선택 Button */}
            <TouchableOpacity
              onPress={selectAllTracks}
              style={[
                styles.button,
                { backgroundColor: '#007bff' }, // Enabled color
                (areAllSelected || flatDisplayList.filter(item => item.type === 'file').length === 0) && styles.disabledButton, // Disabled styles
              ]}
              disabled={areAllSelected || flatDisplayList.filter(item => item.type === 'file').length === 0}
            >
              <Text style={styles.buttonText}>모두 선택</Text>
            </TouchableOpacity>

            <View style={{ width: width * 0.3 }} />

            {/* 모두 해제 Button */}
            <TouchableOpacity
              onPress={deselectAllTracks}
              style={[
                styles.button,
                { backgroundColor: '#dc3545' }, // Enabled color
                selectedTrackUris.length === 0 && styles.disabledButton, // Disabled styles
              ]}
              disabled={selectedTrackUris.length === 0}
            >
              <Text style={styles.buttonText}>모두 해제</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={flatDisplayList}
            keyExtractor={item => item.id}
            renderItem={renderPlaylistItem}
            style={styles.flatList}
            contentContainerStyle={styles.flatListContent}
          />
          {/* <View style={styles.buttonContainer}>
            <Button
              title={`선택된 곡 재생 (${selectedTrackUris.length})`}
              onPress={handlePlaySelected}
              color="blue"
              disabled={selectedTrackUris.length === 0}
            />
          </View> */}
          {!isLoading && selectedTrackUris.length > 0 && (
                  <TouchableOpacity
                    style={styles.playAllButton}
                    onPress={handlePlaySelected}
                  >
                    <FontAwesome name="play" size={RFPercentage(3)} color={colors.white} style={styles.playIcon} />
                    <Text style={styles.playAllButtonText}>선택된 곡 재생 ({selectedTrackUris.length})</Text>
                  </TouchableOpacity>
                )}
        </View>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  playAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      height: RFPercentage(5),
      justifyContent: 'center',
      backgroundColor: colors.blue, // 버튼의 눈에 띄는 색상
      // paddingVertical: 15,
      borderRadius: 30, // 둥글게 만들기
      // marginHorizontal: 20,
      // marginBottom: 20,
      // elevation: 5,
      // shadowColor: '#000',
      // shadowOffset: { width: 0, height: 2 },
      // shadowOpacity: 0.25,
      // shadowRadius: 3.84,
    },
  playAllButtonText: {
      color: colors.white,
      // height: RFPercentage(3),
      fontSize: RFPercentage(2.2),
      fontWeight: 'bold',
      marginLeft: 10, // 아이콘과 텍스트 사이의 공간
    },
  playIcon: {
    // 컴포넌트에 이미 크기와 색상이 설정되어 있음 (명확성을 위해 여기에 추가)
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.lightGrey,
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
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: 'black',
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
    fontSize: RFPercentage(2),
    flex: 1,
    flexShrink: 1,
    color: '#444',
  },
  favoriteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  folderItemContainer: {
    flexDirection: 'row',
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
    alignContent: 'space-between',
    // Add other styles for your container if needed
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff', // White text for enabled state
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#6c757d', // Darker gray for disabled background
    // You might also want to change the text color for disabled state
    // For example:
    // opacity: 0.7,
  },
});

export default PlaylistScreen;