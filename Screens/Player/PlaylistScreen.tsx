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
import TrackPlayer, {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  State,
  usePlaybackState,
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage for persistence
import { useFocusEffect } from '@react-navigation/native';

// import { convertEucKrToUtf8 } from '../../utils/converEucKrToUtf8';

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
  isFavorite?: boolean; // Add isFavorite property
}

const FAVORITE_TRACKS_KEY = '@favoriteTracks'; // Key for AsyncStorage

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

  useFocusEffect(
    useCallback(() => {
      console.log('PlaylistScreen is loading...');
      const fetchPlaylistStructureAndFavorites = async () => {
        try {
          setIsLoading(true);
          // Fetch playlist structure
          const res = await axios.get<PlaylistItem[]>(`${baseURL}stream/playlist/db`);

          // Fetch favorite tracks from AsyncStorage
          const storedFavorites = await AsyncStorage.getItem(FAVORITE_TRACKS_KEY);
          const initialFavoriteUris = storedFavorites ? JSON.parse(storedFavorites) : [];
          setFavoriteTrackUris(initialFavoriteUris);

          const initializeItems = (items: PlaylistItem[]): PlaylistItem[] => {
            return items.map(item => {
              const newItem = {
                ...item,
                isSelected: false,
                isDirectoryOpen: false,
                isFavorite: item.type === 'file' && item.uri ? initialFavoriteUris.includes(item.uri) : false, // Set isFavorite based on stored data
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
      setFlatDisplayList(updateFlatDisplayList(playlistStructure, searchQuery));
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, playlistStructure]);

  /**
   * Persists favorite track URIs to AsyncStorage.
   */
  const saveFavoriteTracks = async (uris: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITE_TRACKS_KEY, JSON.stringify(uris));
      console.log('Favorite tracks saved successfully.');
    } catch (error) {
      console.error('Error saving favorite tracks:', error);
    }
  };

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
            saveFavoriteTracks(updatedUris); // Persist updated favorites
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

          const nameMatch = itemToMatch.name?.toLowerCase().includes(lowerCaseSearchQuery);

          if (itemToMatch.type === 'file') {
            const titleMatch = itemToMatch.title
              ? itemToMatch.title.toLowerCase().includes(lowerCaseSearchQuery)
              : false;
            const artistMatch = itemToMatch.artist
              ? itemToMatch.artist.toLowerCase().includes(lowerCaseSearchQuery)
              : false;
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
              size={RFPercentage(2.5)}
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

    navigation.navigate('Player', {
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
        centerText="🎶 음악 라이브러리"
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
              color="blue"
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
    fontSize: RFPercentage(1.3),
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
    justifyContent: 'center',
    marginBottom: 15,
  },
});

export default PlaylistScreen;