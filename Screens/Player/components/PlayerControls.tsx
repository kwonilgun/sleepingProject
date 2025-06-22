/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PlaylistItem } from '../PlaylistScreen';
// import { PlaylistItem } from '../model/types/TUserNavigator'; // Adjust path as necessary

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  currentTrack: PlaylistItem | undefined;
  togglePlayback: () => void;
  handleSkipPrevious: () => void;
  handleSkipNext: () => void;
  toggleRepeatMode: () => void;
  getRepeatButtonIcon: () => string;
  getRepeatButtonColor: () => string;
  selectedTracksLength: number;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isLoading,
  currentTrack,
  togglePlayback,
  handleSkipPrevious,
  handleSkipNext,
  toggleRepeatMode,
  getRepeatButtonIcon,
  getRepeatButtonColor,
  selectedTracksLength,
}) => {
  return (
    <View style={styles.controlsContainer}>
      <TouchableOpacity
        onPress={toggleRepeatMode}
        disabled={selectedTracksLength === 0}
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
        disabled={!currentTrack || isLoading}
        style={[
          styles.controlButton,
          { backgroundColor: isPlaying ? '#FF4500' : '#28a745' },
        ]}
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
    backgroundColor: '#6c757d',
    padding: RFPercentage(1),
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  controlButtonText: {
    fontSize: RFPercentage(2.5),
    color: 'white',
  },
});

export default PlayerControls;