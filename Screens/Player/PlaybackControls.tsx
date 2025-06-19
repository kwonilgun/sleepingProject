// src/components/PlaybackControls.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { RepeatMode } from '../../hooks/useTrackPlayerSetup'; // Import RepeatMode enum

interface PlaybackControlsProps {
  isPlaying: boolean;
  togglePlayback: () => void;
  handleSkipPrevious: () => void;
  handleSkipNext: () => void;
  toggleRepeatMode: () => void;
  repeatMode: RepeatMode;
  disabled?: boolean;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  togglePlayback,
  handleSkipPrevious,
  handleSkipNext,
  toggleRepeatMode,
  repeatMode,
  disabled = false,
}) => {
  const getRepeatButtonIcon = () => {
    switch (repeatMode) {
      case RepeatMode.Off:
        return 'repeat-off';
      case RepeatMode.RepeatOne:
        return 'repeat-once';
      case RepeatMode.RepeatAll:
        return 'repeat';
      default:
        return 'undo'; // Fallback
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
    <View style={styles.controlsContainer}>
      <TouchableOpacity
        onPress={toggleRepeatMode}
        disabled={disabled}
        style={[styles.controlButton, { backgroundColor: getRepeatButtonColor() }]}
      >
        <MaterialIcon
          name={getRepeatButtonIcon()}
          size={RFPercentage(2.5)}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSkipPrevious}
        disabled={disabled}
        style={[styles.controlButton, styles.skipButton]}
      >
        <Text style={styles.buttonText}>⬅️</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={togglePlayback}
        disabled={disabled}
        style={[styles.controlButton, isPlaying ? styles.pauseButton : styles.playButton]}
      >
        <Text style={styles.buttonText}>
          {isPlaying ? '⏸️' : '▶️'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSkipNext}
        disabled={disabled}
        style={[styles.controlButton, styles.skipButton]}
      >
        <Text style={styles.buttonText}>➡️</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 15,
  },
  controlButton: {
    padding: RFPercentage(1),
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  playButton: {
    backgroundColor: "#28a745",
  },
  pauseButton: {
    backgroundColor: "#FF4500",
  },
  skipButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    fontSize: RFPercentage(2.5),
    color: 'white',
  },
});

export default PlaybackControls;