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
  name: string;
  title?: string;
  artist?: string;
  path: string;
  type: 'file' | 'folder';
  uri?: string;
  duration?: number;
  isSelected?: boolean; // 추가됨
  isDirectoryOpen?: boolean; // 추가됨
  children?: PlaylistItem[];
  depth?: number; // 추가됨
}

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Stores the hierarchical structure received from the server
  const [playlistStructure, setPlaylistStructure] = useState<PlaylistItem[]>([]);
  // A flattened list of items currently visible in the FlatList (including expanded folder contents)
  const [flatDisplayList, setFlatDisplayList] = useState<PlaylistItem[]>([]);
  // Stores the URIs of currently selected music tracks
  const [selectedTrackUris, setSelectedTrackUris] = useState<string[]>([]);
  // State to track if all available tracks are selected
  const [areAllSelected, setAreAllSelected] = useState<boolean>(false);

  useEffect(() => {
    console.log('PlaylistScreen is loading...');
    const fetchPlaylistStructure = async () => {
      try {
        // Fetch the structured playlist data from your Node.js backend
        const res = await axios.get<PlaylistItem[]>(`${baseURL}stream/playlist/structure`);


        // Initialize isSelected and isDirectoryOpen states for all items
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
        // Build the initial flat list for display (only top-level items visible at first)
        const result = updateFlatDisplayList(initialStructure);
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

  // Effect to update `areAllSelected` when the `playlistStructure` or `selectedTrackUris` change
  useEffect(() => {
    const allPlayableTracks: PlaylistItem[] = [];
    const collectAllFiles = (items: PlaylistItem[]) => {
      items.forEach(item => {
        if (item.type === 'file') {
          allPlayableTracks.push(item);
        } else if (item.type === 'folder' && item.children) {
          collectAllFiles(item.children);
        }
      });
    };
    collectAllFiles(playlistStructure); // Collect all files from the entire structure

    const totalPlayableTracksCount = allPlayableTracks.length;
    setAreAllSelected(
      totalPlayableTracksCount > 0 && selectedTrackUris.length === totalPlayableTracksCount
    );
  }, [playlistStructure, selectedTrackUris]);

  /**
 * 계층적 재생 목록 구조를 평탄화하여 FlatList 렌더링에 사용합니다.
 * isDirectoryOpen 상태를 고려하며, UI 들여쓰기를 위한 depth 속성을 추가합니다.
 * @param {PlaylistItem[]} structure - 계층적 재생 목록 구조.
 * @param {number} currentDepth - 현재 중첩 레벨 (들여쓰기용).
 * @returns {PlaylistItem[]} 평탄화된 목록.
 */
const updateFlatDisplayList = (structure: PlaylistItem[], currentDepth = 0): PlaylistItem[] => {
  let flattened: PlaylistItem[] = []; // PlaylistItem[] 타입으로 명시적으로 선언
  structure.forEach(item => {
    // 항목이 null 또는 undefined가 아닌지 확인한 후 추가 및 처리합니다.
    if (item) {
      flattened.push({ ...item, depth: currentDepth }); // 현재 항목 추가

      // 열린 폴더인 경우, 재귀적으로 자식 항목을 추가합니다.
      // item.children이 존재하고 배열인지 확인합니다.
      if (item.type === 'folder' && item.isDirectoryOpen && item.children && Array.isArray(item.children)) {
        flattened = flattened.concat(updateFlatDisplayList(item.children, currentDepth + 1));
      }
    }
  });

  // 호출자가 이 배열을 사용하여 상태를 설정하도록 반환합니다.
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

    // Re-collect all selected track URIs from the updated structure
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

    // Re-render the flat list to reflect selection changes
    setFlatDisplayList(updateFlatDisplayList(updatedStructure)); // FIX: Update flatDisplayList
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
    // Update the flat list to reflect folder expansion/collapse
    setFlatDisplayList(updateFlatDisplayList(updatedStructure)); // FIX: Update flatDisplayList
  };

  /**
   * Selects all playable tracks in the entire music library.
   */
  const selectAllTracks = () => {
    const updateRecursive = (items: PlaylistItem[]): PlaylistItem[] => {
      return items.map(item => {
        if (item.type === 'file') {
          return { ...item, isSelected: true };
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
    const collectAllFileUris = (items: PlaylistItem[]) => {
      items.forEach(item => {
        if (item.type === 'file' && item.uri) {
          newSelectedUris.push(item.uri);
        } else if (item.type === 'folder' && item.children) {
          collectAllFileUris(item.children);
        }
      });
    };
    collectAllFileUris(updatedStructure);
    setSelectedTrackUris(newSelectedUris);
    setFlatDisplayList(updateFlatDisplayList(updatedStructure)); // FIX: Refresh display
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
    setSelectedTrackUris([]); // Clear all selected URIs
    setFlatDisplayList(updateFlatDisplayList(updatedStructure)); // FIX: Refresh display
  };

  /**
   * Handles playing the selected tracks. Navigates to `PlayerScreen`.
   */
  const handlePlaySelected = () => {
    if (selectedTrackUris.length === 0) {
      Alert.alert('재생할 곡을 선택해주세요.');
      return;
    }

    // Collect all playable files from the entire structure (not just selected ones)
    // This is passed to the PlayerScreen so it can manage next/previous tracks within the full list.
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
      selectedTracks: selectedTrackUris, // URIs of tracks to start playing
      playlist: fullPlayableFilesForPlayer, // The complete list of all playable tracks
    });
  };

  /**
   * Renders a single item in the FlatList, distinguishing between files and folders.
   * @param {Object} - Destructured item and index from FlatList.
   */
  const renderPlaylistItem = ({ item }: { item: PlaylistItem }) => {
    // Determine indentation based on depth
    const indentation = item.depth ? item.depth * 20 : 0;

    // Use `item.title` for files if available, otherwise `item.name`. For folders, use `item.name`.
    const displayLabel = item.type === 'file' && item.title
      ? convertEucKrToUtf8(item.title)
      : convertEucKrToUtf8(item.name);

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
    } else { // type === 'file'

      // Ensure artistText is always a string or empty string
      const artistText = item.artist ? ` - ${String(convertEucKrToUtf8(item.artist))}` : '';
      return (
        <View style={[styles.playlistItemContainer, { paddingLeft: 10 + indentation }]}>
          <CustomCheckBox
            value={item.isSelected!}
            onValueChange={(newValue) => toggleSelectTrack(item.id, newValue)}
          />
          <Text style={styles.playlistItemText} numberOfLines={1}>
            {displayLabel}{artistText}
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
    // You can implement language selection logic here
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
        rightPressActive={true} // Set to true since we have a custom component
        isCenterView={false}
        centerText=""
        rightText={''}
        isRightView={true} // Set to true to display custom component
        rightCustomView={RightCustomComponent}
      />

      <View style={styles.container}>
        <Text style={styles.playlistTitle}>🎶 음악 라이브러리 (폴더 및 파일 선택)</Text>
        <View style={styles.selectionButtonsContainer}>
          <View style={styles.selectionButtonsContainer}>
            <Button
              title="모두 선택"
              onPress={selectAllTracks}
              color="#007bff"
              disabled={areAllSelected || flatDisplayList.filter(item => item.type === 'file').length === 0}
            />
            <View style={{ width: 10 }} /><Button // <--- Make sure there's no newline or space here
              title="모두 해제"
              onPress={deselectAllTracks}
              color="#dc3545"
              disabled={selectedTrackUris.length === 0}
            />
          </View>
        </View>
        <FlatList
          data={flatDisplayList}
          keyExtractor={(item) => item.id} // Use item.id (path) as key
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
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20, // Add some padding at the bottom of the scrollable area
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
    elevation: 1, // subtle shadow for Android
    shadowColor: '#000', // subtle shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  playlistItemText: {
    marginLeft: 15,
    fontSize: 16,
    flex: 1, // Allow text to take remaining space and wrap
    flexShrink: 1,
    color: '#444',
  },
  folderItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#e9e9e9', // Slightly different background for folders
    borderRadius: 8,
    marginBottom: 8,
    paddingRight: 10,
    elevation: 2, // More prominent shadow for folders
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