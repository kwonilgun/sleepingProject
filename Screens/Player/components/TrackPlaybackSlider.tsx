import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer from 'react-native-track-player';
import { width } from '../../../assets/common/BaseValue';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { formatTime } from '../../../utils/formatTime';
import { PlaylistItem } from '../PlaylistScreen';
import { Progress } from 'react-native-track-player';

interface TrackPlaybackSliderProps {
  progress: Progress ;
  currentTrack: PlaylistItem;
  isLoading: boolean;

}

const TrackPlaybackSlider: React.FC<TrackPlaybackSliderProps> = ({
  progress,
  currentTrack,
  isLoading,
}) => {
  return (
    <View style={styles.timeContainer}>
      <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={progress.duration || 0}
        value={progress.position}
        onSlidingComplete={async (value) => {
          await TrackPlayer.seekTo(value);
        }}
        minimumTrackTintColor="#1FB28A"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#1FB28A"
        disabled={!currentTrack || isLoading}
      />
      <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
})

export default TrackPlaybackSlider;