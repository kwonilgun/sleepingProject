import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { RFPercentage } from 'react-native-responsive-fontsize';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  setVolume,
  toggleMute,
}) => {
  return (
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
        onValueChange={async (value) => {
          setVolume(value);
          // Set volume using TrackPlayer directly, if it's responsible for audio output
          // In a real app, you might want to call TrackPlayer.setVolume(value) here
          // For now, it's handled by the parent PlayerScreen.
        }}
        minimumTrackTintColor="#1FB28A"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#1FB28A"
      />
      <Text style={styles.volumeText}>{(volume * 100).toFixed(0)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  muteButton: {
    marginRight: 10,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  volumeText: {
    fontSize: RFPercentage(1.8),
    marginLeft: 10,
    minWidth: 40,
    textAlign: 'center',
  },
});

export default VolumeControl;