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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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
  State,
  usePlaybackState,
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { width } from '../../styles/responsiveSize';

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
  isFavorite?: boolean;
}

const FAVORITE_TRACKS_KEY = '@favoriteTracks';
const SELECTED_TRACKS_KEY = '@selectedTracks';

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({ navigation }) => {
  const playbackState = usePlaybackState();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playlistStructure, setPlaylistStructure] = useState<PlaylistItem[]>([]);
  const [flatDisplayList, setFlatDisplayList] = useState<PlaylistItem[]>([]);
  const [selectedTrackUris, setSelectedTrackUris] = useState<string[]>([]);
  const [areAllSelected, setAreAllSelected] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [favoriteTrackUris, setFavoriteTrackUris] = useState<string[]>([]);

  const saveTracksToStorage = async (key: string, uris: string[]) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(uris));
      console.log(`${key} tracks saved successfully.`);
    } catch (error) {
      console.error(`Error saving ${key} tracks:`, error);
    }
  };

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
          const res = await axios.get<PlaylistItem[]>(`${baseURL}stream/playlist/db`);

          const storedFavorites = await loadTracksFromStorage(FAVORITE_TRACKS_KEY);
          setFavoriteTrackUris(storedFavorites);

          const storedSelected = await loadTracksFromStorage(SELECTED_TRACKS_KEY);
          setSelectedTrackUris(storedSelected);

          const initializeItems = (items: PlaylistItem[]): PlaylistItem[] => {
            return items.map(item => {
              const newItem = {
                ...item,
                isSelected: item.type === 'file' && item.uri ? storedSelected.includes(item.uri) : false,
                isDirectoryOpen: false,
                isFavorite: item.type === 'file' && item.uri ? storedFavorites.includes(item.uri) : false,
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
    const allPlayableTracksInDisplay: PlaylistItem[] = flatDisplayList.filter(item => item.type === 'file');
    const totalPlayableTracksInDisplayCount = allPlayableTracksInDisplay.length;

    const urisInDisplay = new Set(allPlayableTracksInDisplay.map(item => item.uri).filter(Boolean) as string[]);

    const allDisplayTracksSelected = totalPlayableTracksInDisplayCount > 0 &&
      Array.from(urisInDisplay).every(uri => selectedTrackUris.includes(uri));

    setAreAllSelected(allDisplayTracksSelected);
  }, [flatDisplayList, selectedTrackUris]);

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

  const toggleFavoriteTrack = (id: string) => {
    const updateRecursive = (items: PlaylistItem[]): PlaylistItem[] => {
      return items.map(item => {
        if (item.type === 'file' && item.id === id) {
          const newFavoriteStatus = !item.isFavorite;
          setFavoriteTrackUris(prevUris => {
            const updatedUris = newFavoriteStatus
              ? [...prevUris, item.uri!]
              : prevUris.filter(uri => uri !== item.uri);
            saveTracksToStorage(FAVORITE_TRACKS_KEY, updatedUris);
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

          const nameMatch = itemToMatch.name?.normalize('NFC').toLowerCase().includes(lowerCaseSearchQuery);

          if (itemToMatch.type === 'file') {
            const titleMatch = itemToMatch.name
                          ? itemToMatch.name.normalize('NFC').toLowerCase().trim().includes(lowerCaseSearchQuery)
                          : false;
            const artistMatch = itemToMatch.artist
              ? itemToMatch.artist.normalize('NFC').toLowerCase().includes(lowerCaseSearchQuery)
              : false;

            return nameMatch || titleMatch || artistMatch;
          }
          return nameMatch;
        };

        // Modified sorting logic for children
        const sortedChildren =
        item.type === 'folder' && item.children
          ? [...item.children].sort((a, b) => {
              // Folders always come first
              if (a.type === 'folder' && b.type !== 'folder') return -1;
              if (a.type !== 'folder' && b.type === 'folder') return 1;

              // Helper function for natural sort
              const naturalSort = (strA:any, strB:any) => {
                const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                return collator.compare(strA, strB);
              };

              // Get names, handling potential undefined 'name' properties
              const nameA = a.name || '';
              const nameB = b.name || '';

              // For files, sort by name (title) in ascending order using natural sort
              if (a.type === 'file' && b.type === 'file') {
                return naturalSort(nameA, nameB);
              }

              // For folders, sort by name in ascending order using natural sort
              // Your original code had folders sorting in descending order, I've adjusted this to ascending for consistency,
              // but you can change it back if needed.
              return naturalSort(nameA, nameB);
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
    saveTracksToStorage(SELECTED_TRACKS_KEY, newSelectedUris);

    setFlatDisplayList(updateFlatDisplayList(updatedStructure, searchQuery));
  };

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
    saveTracksToStorage(SELECTED_TRACKS_KEY, newSelectedUris);

    setFlatDisplayList(updateFlatDisplayList(updatedStructure, searchQuery));
  };

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
    saveTracksToStorage(SELECTED_TRACKS_KEY, []);
    setFlatDisplayList(updateFlatDisplayList(updatedStructure, searchQuery));
  };

  const renderPlaylistItem = ({ item }: { item: PlaylistItem }) => {
    const indentation = item.depth ? item.depth * 20 : 0;

    const displayLabel =
      item.type === 'file' && item.name
        ? item.name.replace(/\.mp3$/i, '')
        : item.name;

    if (item.type === 'folder') {
      return (
        <TouchableOpacity
          testID={`folder-${displayLabel}`}
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
      return (
        <View
          testID={`file-${displayLabel}`}
          style={[styles.playlistItemContainer, { paddingLeft: 10 + indentation }]}>
          <CustomCheckBox
            value={item.isSelected!}
            onValueChange={newValue => toggleSelectTrack(item.id, newValue)}
          />
          <Text style={styles.playlistItemText} numberOfLines={2}>
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

  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingOverlay}>
  //               <ActivityIndicator size="large" color={colors.white} />
  //             </View>
  //   );
  // }

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

  const handlePlaySelected = () => {
    if (selectedTrackUris.length === 0 && playbackState.state !== State.Playing) {
      Alert.alert('재생할 곡을 선택해주세요.');
      return;
    }

    console.log('handlePlaySelected selectedTrackUris', selectedTrackUris);

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
    navigation.goBack();
  };

  const navigateToFavorites = () => {
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

    const favoritedFiles = allFiles.filter(file => favoriteTrackUris.includes(file.uri!));

    // Natural sort for favoritedFiles
    const naturalSort = (strA:any, strB:any) => {
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        return collator.compare(strA, strB);
    };

    const sortedFavoritedFiles = [...favoritedFiles].sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return naturalSort(nameA, nameB);
    });

    navigation.navigate('Favorite', {
      screen: 'FavoriteScreen',
      params: {
        favoritedTracks: sortedFavoritedFiles, // Pass the naturally sorted list
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

  // New function to clear search query
  const clearSearch = () => {
    setSearchQuery('');
    // The useEffect for searchQuery will automatically update flatDisplayList
  };

  return (
    <WrapperContainer containerStyle={{ paddingHorizontal: 0 }}>
      {/* <HeaderComponent
        isLeftView={false}
        leftCustomView={LeftCustomComponent}
        rightPressActive={false}
        isCenterView={false}
        centerText="홈"
        isRight = {false}
        isRightView={false}
        rightCustomView={RightCustomComponent}
      /> */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? RFPercentage(1) : 0}
      >
        {
          !isLoading ? (
            <View style={styles.container}>
              {/* Search Input with Clear Button */}
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="음악 검색..."
                  placeholderTextColor="#888"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && ( // Show clear button only when there's text
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <FontAwesome name="times-circle" size={RFPercentage(3)} color={colors.grey} />
                  </TouchableOpacity>
                )}
              </View>

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
                  testID="allSelectedButton"
                >
                  <Text style={styles.buttonText}>모두 선택</Text>
                </TouchableOpacity>

                {/* <View style={{ width: width * 0.05}} /> */}

                <TouchableOpacity
                  onPress={deselectAllTracks}
                  style={[
                    styles.button,
                    { backgroundColor: '#dc3545' },
                    selectedTrackUris.length === 0 && styles.disabledButton,
                  ]}
                  disabled={selectedTrackUris.length === 0}
                >
                  <Text style={styles.buttonText}>모두 해제</Text>
                </TouchableOpacity>

                {/* <View style={{ width: width * 0.05}} /> */}

              </View>

          
              <FlatList
                data={flatDisplayList}
                keyExtractor={item => item.id}
                renderItem={renderPlaylistItem}
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
              />
              
              
              {selectedTrackUris.length > 0 && (
                      <TouchableOpacity
                        style={styles.playAllButton}
                        onPress={handlePlaySelected}
                        testID="playSelectButton"
                      >
                        <FontAwesome name="play" size={RFPercentage(3)} color={colors.white} style={styles.playIcon} />
                        <Text style={styles.playAllButtonText}>({selectedTrackUris.length})</Text>
                      </TouchableOpacity>
                    )}
            </View>
          ) : (
             <View style={styles.loadingOverlay}>
                 <ActivityIndicator size="large" color={colors.white} />
              </View>
          )
        }
        
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it's above other content
  },
  
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.lightGrey,
    // borderColor: 'red',
    // borderWidth: 2,
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
  searchInputContainer: { // New style for the container of search input and button
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: RFPercentage(3),
    paddingRight: 10, // Add padding for the button
  },
  searchInput: {
    flex: 1, // Take up remaining space
    paddingHorizontal: 15,
    fontSize: 16,
    color: 'black',
  },
  clearButton: { // Style for the clear button
    padding: 5,
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
    width: width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between', // This is the key change for even distribution
    alignItems: 'center', // Align items vertically in the center
    marginBottom: RFPercentage(1),
    // borderWidth: 1,
    // borderColor: 'red',
  },
  button: {
    width: width * 0.3,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  playAllButton: {
    flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.blue, // 버튼의 눈에 띄는 색상
        paddingVertical: 15,
        borderRadius: RFPercentage(5), // 둥글게 만들기
        marginHorizontal: 20,
        // marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
  playAllButtonText: {
      color: colors.white,
      fontSize: RFPercentage(1.5),
      fontWeight: 'bold',
      marginLeft: 10,
    },
  playIcon: {},
});

export default PlaylistScreen;