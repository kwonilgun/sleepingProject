/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useRef, useState, useEffect } from 'react';
import { Button, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { width } from '../../assets/common/BaseValue';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../../styles/colors';
import { RFPercentage } from 'react-native-responsive-fontsize';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import { convertEucKrToUtf8 } from '../../utils/converEucKrToUtf8';

// Define the structure for PlaylistItem for clarity
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

interface PlayerScreenProps {
  route: {
    params: {
      selectedTracks: string[]; // This is an array of URIs/IDs
      playlist: PlaylistItem[]; // This is the full list of all playable items
    };
  };
  navigation: any;
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
  const playerRef = useRef<Video>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);

  const { selectedTracks, playlist } = route.params;

  // Determine the actual track object being played based on the currentTrackIndex
  const currentSelectedTrackUri = selectedTracks[currentTrackIndex];
  const currentTrack = playlist.find(item => item.uri === currentSelectedTrackUri && item.type === 'file');

  useEffect(() => {
    // Only proceed if a track is selected and found in the playlist
    if (currentTrack) {
      console.log('currentTrack = ', currentTrack);
      console.log('Now playing: title', currentTrack.title || currentTrack.name);
      console.log('Now playing: uri', currentTrack.uri || '없음');
      setIsPlaying(true);
      if(currentTrack.duration){
        console.log('duration = ', currentTrack.duration);
        setDuration(Math.floor(Number(currentTrack.duration)));
      }
      setCurrentTime(0); // Reset time when a new track starts

      

      // Fetch duration if not already present in the track object (optional, if your backend doesn't provide it initially)
      // if (!currentTrack.duration) {
      //   axios.get(`${baseURL}stream/meta/${currentTrack.uri}`)
      //     .then(res => {
      //       setDuration(res.data.duration);
      //     })
      //     .catch(e => {
      //       console.error('Duration fetch failed:', e);
      //       setDuration(0); // Set to 0 if duration fetch fails
      //     });
      // } else {
      //   setDuration(currentTrack.duration);
      // }
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      console.log('No track selected or found.');
    }
  }, [currentTrackIndex, selectedTracks, playlist, currentTrack]); // Depend on currentTrack for re-initialization

  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  const handleError = (error: any) => {
    console.error('Playback error:', error);
  };

  const handleEnd = () => {
    console.log('Track ended');
    if (selectedTracks.length > 0) {
      const nextIndex = currentTrackIndex + 1;
      if (nextIndex < selectedTracks.length) {
        setCurrentTrackIndex(nextIndex);
        // Playback will automatically start due to useEffect when currentTrackIndex changes
      } else {
        // All selected tracks played. Stop or loop.
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentTrackIndex(0); // Reset to first track for potential re-play
      }
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleLoad = (meta: { duration: number }) => {
    setDuration(meta.duration);
    // Automatically start playing when loaded if intended
    // setIsPlaying(true); // Uncomment if you want to auto-play after load
  };

  const handleProgress = (progress: { currentTime: number }) => {
    setCurrentTime(progress.currentTime);
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRestart = () => {
    if (playerRef.current) {
      playerRef.current.seek(0);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const handleSkipPrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      // If at the first track, restart it
      handleRestart();
    }
  };

  const handleSkipNext = () => {
    if (currentTrackIndex < selectedTracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      // If at the last track, you might want to stop or loop to the first
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentTrackIndex(0); // Optional: reset to first track
    }
  };

  const currentTrackDisplayTitle = currentTrack?.title
    ? convertEucKrToUtf8(currentTrack.title)
    // : currentTrack?.name
    // ? convertEucKrToUtf8(currentTrack.name)
    : '선택된 곡 없음';

  const currentTrackArtist = currentTrack?.artist
    ? ` - ${convertEucKrToUtf8(currentTrack.artist)}`
    : '';

  const streamingUri = currentTrack?.uri ? `${baseURL}stream/${currentTrack.uri}` : undefined;

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={() => navigation.goBack()}>
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
        rightPressActive={false}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        centerText=""
        containerStyle={{ paddingHorizontal: 8 }}
        isRight={false}
      />
      <View style={styles.container}>
        <Text style={styles.title}>🎵 음악 스트리밍 재생</Text>
        <Text style={styles.nowPlaying}>
          🎧 현재 재생 중: {currentTrackDisplayTitle}
          {currentTrackArtist}
        </Text>

        <Button
          title={isPlaying ? '⏸️ 일시 정지' : '▶️ 재생 시작'}
          onPress={togglePlayback}
          disabled={!currentTrack}
          color={isPlaying ? "#FF4500" : "#28a745"} // Green for play, orange for pause
        />

        <View style={{ marginTop: 10 }}>
          <Button
            title="⏪ 처음부터 재생"
            onPress={handleRestart}
            color="#007bff" // Blue
            disabled={!currentTrack || !isPlaying}
          />
        </View>
        <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
          <Button
            title="⬅️ 이전 곡"
            onPress={handleSkipPrevious}
            color="#6c757d" // Grey
            disabled={currentTrackIndex === 0 && currentTime < 3} // Disable if first song and near beginning
          />
          <Button
            title="다음 곡 ➡️"
            onPress={handleSkipNext}
            color="#6c757d" // Grey
            disabled={currentTrackIndex >= selectedTracks.length - 1}
          />
        </View>

        {currentTrack && (
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onSlidingComplete={(value) => playerRef.current?.seek(value)}
              minimumTrackTintColor="#1FB28A"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#1FB28A"
              disabled={!isPlaying}
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        )}

        <Text style={styles.label}>🔊 볼륨: {(volume * 100).toFixed(0)}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          step={0.01}
          onValueChange={setVolume}
          minimumTrackTintColor="#1FB28A"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#1FB28A"
        />

        {streamingUri && (
          <Video
            ref={playerRef}
            source={{
              uri: streamingUri,
            }}
            audioOnly={true}
            paused={!isPlaying}
            volume={volume}
            onError={handleError}
            onEnd={handleEnd}
            onLoad={handleLoad}
            onProgress={handleProgress}
            playInBackground={true} // Allow playback in background
            ignoreSilentSwitch="obey" // Respect silent switch
            style={{ height: 0, width: 0 }} // Invisible
          />
        )}
      </View>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  nowPlaying: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#555',
  },
  label: {
    marginTop: 20,
    marginBottom: 5,
    fontSize: 16,
    color: '#333',
  },
  slider: {
    height: 40,
    width: '80%', // Use percentage for better responsiveness
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    minWidth: 40,
    textAlign: 'center',
  },
});

export default PlayerScreen;