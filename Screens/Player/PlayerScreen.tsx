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
import strings from '../../constants/lang';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import { convertEucKrToUtf8 } from '../../utils/converEucKrToUtf8';

interface PlayerScreenProps {
  route: any; // Using 'any' for simplicity, ideally define a more specific type
  navigation: any; // Using 'any' for simplicity
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
  const playerRef = useRef<Video>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);

  const { selectedTracks, playlist } = route.params;

  useEffect(() => {
    // Reset playback when selectedTracks or currentTrackIndex changes
    if (selectedTracks && selectedTracks.length > 0) {
      const currentTrackId = selectedTracks[currentTrackIndex];
      const track = playlist.find((item: any) => item.id === currentTrackId);
      if (track) {
        setIsPlaying(true);
        setCurrentTime(0); // Reset time when a new track starts
        axios.get(`${baseURL}stream/meta/${track.uri}`)
          .then(res => {
            setDuration(res.data.duration);
          })
          .catch(e => {
            console.error('duration 가져오기 실패', e);
            setDuration(0);
          });
      }
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [selectedTracks, currentTrackIndex, playlist]);


  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  const handleError = (error: any) => {
    console.error('재생 중 오류:', error);
  };

  const handleEnd = () => {
    console.log('재생 종료됨');
    if (selectedTracks.length > 0) {
      const nextIndex = currentTrackIndex + 1;
      if (nextIndex < selectedTracks.length) {
        setCurrentTrackIndex(nextIndex);
        setIsPlaying(true); // Automatically play next track
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentTrackIndex(0); // Loop or stop
      }
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleLoad = (meta: { duration: number }) => {
    setDuration(meta.duration);
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
  if (selectedTracks.length > 0 && currentTrackIndex > 0) {
    setCurrentTrackIndex(currentTrackIndex - 1);
    setIsPlaying(true);
    setCurrentTime(0);
  }
};

const handleSkipNext = () => {
  if (selectedTracks.length > 0 && currentTrackIndex < selectedTracks.length - 1) {
    setCurrentTrackIndex(currentTrackIndex + 1);
    setIsPlaying(true);
    setCurrentTime(0);
  }
};


  const currentTrackId = selectedTracks && selectedTracks.length > 0 ? selectedTracks[currentTrackIndex] : null;
  const currentTrack = currentTrackId ? playlist.find((item: any) => item.id === currentTrackId) : null;

  const currentTrackUri = currentTrack ? `${baseURL}stream/${currentTrack.uri}` : null;
  const currentTrackTitle = currentTrack ? convertEucKrToUtf8( currentTrack.title) : '선택된 곡 없음';

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <>
          {/* <Text style={styles.leftTextStyle}>홈</Text> */}
          <FontAwesome
            style={{
              height: RFPercentage(8),
              width: RFPercentage(10),
              marginTop: RFPercentage(2),
              color: colors.black,
              fontSize: RFPercentage(5),
              fontWeight: 'bold',
              // transform: [{scaleX: 1.5}], // 폭을 1.5배 넓힘
            }}
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
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        centerText=""
        containerStyle={{paddingHorizontal: 8}}
        isRight={false}
        // rightText={'       '}
        // rightTextStyle={{color: colors.lightBlue}}
        // onPressRight={() => {}}
      />
    <View style={styles.container}>
      <Text style={styles.title}>🎵 음악 스트리밍 재생</Text>
      <Text style={styles.nowPlaying}>
        🎧 현재 재생 중: {currentTrackTitle}
      </Text>

      <Button
        title={isPlaying ? '⏸️ 일시 정지' : '▶️ 재생 시작'}
        onPress={togglePlayback}
        disabled={!currentTrack}
      />

      <View style={{ marginTop: 10 }}>
        <Button
          title="⏪ 처음부터 재생"
          onPress={handleRestart}
          color="#FF8C00"
          disabled={!currentTrack || !isPlaying}
        />
      </View>
      <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button
          title="⬅️ 이전 곡"
          onPress={handleSkipPrevious}
          color="#1E90FF"
          disabled={currentTrackIndex === 0}
        />
        <Button
          title="다음 곡 ➡️"
          onPress={handleSkipNext}
          color="#32CD32"
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

      {currentTrackUri && (
        <Video
          ref={playerRef}
          source={{
            uri: currentTrackUri,
          }}
          audioOnly={true}
          paused={!isPlaying}
          volume={volume}
          onError={handleError}
          onEnd={handleEnd}
          onLoad={handleLoad}
          onProgress={handleProgress}
          playInBackground={false}
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
    width: width * 0.8,
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