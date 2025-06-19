// src/components/TrackProgressSlider.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useProgress } from 'react-native-track-player';
import { width } from '../../styles/responsiveSize';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { formatTime } from '../../utils/playerUtils'; // Import utility function

interface TrackProgressSliderProps {
  progress: ReturnType<typeof useProgress>;
  onSlidingComplete: (value: number) => void;
  disabled?: boolean;
}

const TrackProgressSlider: React.FC<TrackProgressSliderProps> = ({
  progress,
  onSlidingComplete,
  disabled = false,
}) => {
  return (
    <View style={styles.timeContainer}>
      <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={progress.duration || 0}
        value={progress.position}
        onSlidingComplete={onSlidingComplete}
        minimumTrackTintColor="#1FB28A"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#1FB28A"
        disabled={disabled}
      />
      <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.9,
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  slider: {
    height: 40,
    width: '70%',
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: RFPercentage(1.8),
    minWidth: 40,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});

export default TrackProgressSlider;