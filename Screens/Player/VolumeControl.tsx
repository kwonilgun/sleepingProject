// src/components/VolumeControl.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFPercentage } from 'react-native-responsive-fontsize';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  setVolume: (value: number) => void;
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
        onValueChange={setVolume} // setVolume directly updates state and TrackPlayer volume
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

export default VolumeControl;