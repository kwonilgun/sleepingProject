/* eslint-disable react-native/no-inline-styles */
// src/components/PlayerControls.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFPercentage } from 'react-native-responsive-fontsize';
import colors from '../../styles/colors';
import { usePlaybackState, useProgress, State } from 'react-native-track-player';
import { width } from '../../styles/responsiveSize';

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  currentTrack: any; // You might want to define a more specific type for currentTrack
  displayTitle: string;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode; // Define RepeatMode enum here or import it
  togglePlayback: () => void;
  handleSkipPrevious: () => void;
  handleSkipNext: () => void;
  toggleRepeatMode: () => void;
  toggleMute: () => void;
  onVolumeChange: (value: number) => void;
  onSeek: (value: number) => void;
}

enum RepeatMode {
  Off,
  RepeatOne,
  RepeatAll,
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isLoading,
  currentTrack,
  displayTitle,
  volume,
  isMuted,
  repeatMode,
  togglePlayback,
  handleSkipPrevious,
  handleSkipNext,
  toggleRepeatMode,
  toggleMute,
  onVolumeChange,
  onSeek,
}) => {
  const progress = useProgress();

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getRepeatButtonIcon = () => {
    switch (repeatMode) {
      case RepeatMode.Off:
        return 'repeat-off';
      case RepeatMode.RepeatOne:
        return 'repeat-once';
      case RepeatMode.RepeatAll:
        return 'repeat';
      default:
        return 'undo';
    }
  };

  const getRepeatButtonColor = () => {
    switch (repeatMode) {
      case RepeatMode.Off:
        return '#800080'; // Purple for off
      case RepeatMode.RepeatOne:
        return '#FFA500'; // Orange for repeat one
      case RepeatMode.RepeatAll:
        return '#007bff'; // Blue for repeat all
      default:
        return '#800080';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎧 제목:</Text>
      <Text style={styles.nowPlaying} numberOfLines={1} ellipsizeMode="tail">
        {displayTitle}
        {isLoading && ' (로딩 중...)'}
      </Text>

      <View style={styles.controlsContainer}>
        {/* Repeat Button */}
        <TouchableOpacity
          onPress={toggleRepeatMode}
          disabled={!currentTrack} // Disable if no track is selected
          style={{
            backgroundColor: getRepeatButtonColor(),
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 5,
          }}
        >
          <MaterialIcon
            name={getRepeatButtonIcon()}
            size={RFPercentage(2.5)}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkipPrevious}
          disabled={!currentTrack}
          style={styles.controlButton}
        >
          <Text style={styles.controlButtonText}>⬅️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayback}
          disabled={!currentTrack}
          style={[styles.controlButton, isPlaying ? styles.pauseButton : styles.playButton]}
        >
          <Text style={styles.controlButtonText}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkipNext}
          disabled={!currentTrack}
          style={styles.controlButton}
        >
          <Text style={styles.controlButtonText}>➡️</Text>
        </TouchableOpacity>
      </View>

      {currentTrack && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={progress.duration || 0}
            value={progress.position}
            onSlidingComplete={onSeek}
            minimumTrackTintColor="#1FB28A"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#1FB28A"
            disabled={!currentTrack || isLoading}
          />
          <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
        </View>
      )}

      <View style={styles.volumeContainer}>
        <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
          <MaterialIcon
            name={isMuted || volume === 0 ? 'volume-mute' : 'volume-high'}
            size={RFPercentage(5)}
            color={isMuted || volume === 0 ? 'red' : '#333'}
          />
        </TouchableOpacity>
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          step={0.01}
          onValueChange={onVolumeChange}
          minimumTrackTintColor="#1FB28A"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#1FB28A"
        />
        <Text style={styles.volumeText}>{(volume * 100).toFixed(0)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  nowPlaying: {
    fontSize: RFPercentage(2.5),
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#34495e',
    width: '100%',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 15,
    width: '100%',
  },
  controlButton: {
    backgroundColor: '#6c757d',
    padding: RFPercentage(1),
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  playButton: {
    backgroundColor: '#28a745',
  },
  pauseButton: {
    backgroundColor: '#FF4500',
  },
  controlButtonText: {
    fontSize: RFPercentage(2.5),
    color: 'white',
  },
  slider: {
    height: 40,
    width: '70%',
    marginHorizontal: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.9,
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: RFPercentage(1.8),
    minWidth: 40,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  muteButton: {
    padding: 10,
    marginRight: 10,
  },
  volumeText: {
    fontSize: RFPercentage(2),
    marginLeft: 10,
    color: '#333',
    minWidth: 40,
    textAlign: 'right',
  },
});

export default PlayerControls;