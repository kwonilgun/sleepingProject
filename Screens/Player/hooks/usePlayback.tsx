import { useState, useCallback } from 'react';
import TrackPlayer, { State } from 'react-native-track-player';
import { formatTime } from '../../../utils/formatTime';

const usePlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [prevVolume, setPrevVolume] = useState(0.5);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: one, 2: all

  const togglePlayback = useCallback(async () => {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
      setIsPlaying(false);
    } else {
      await TrackPlayer.play();
      setIsPlaying(true);
    }
  }, []);

  const toggleMute = useCallback(async () => {
    if (isMuted) {
      await TrackPlayer.setVolume(prevVolume);
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      await TrackPlayer.setVolume(0);
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, prevVolume, volume]);

  const getRepeatButtonIcon = useCallback(() => {
    switch (repeatMode) {
      case 0: return 'repeat-off';
      case 1: return 'repeat-once';
      case 2: return 'repeat';
      default: return 'repeat-off';
    }
  }, [repeatMode]);

  const getRepeatButtonColor = useCallback(() => {
    switch (repeatMode) {
      case 0: return '#800080';
      case 1: return '#FFA500';
      case 2: return '#007bff';
      default: return '#800080';
    }
  }, [repeatMode]);

  return {
    isPlaying,
    togglePlayback,
    toggleMute,
    isMuted,
    volume,
    setVolume,
    getRepeatButtonIcon,
    getRepeatButtonColor,
    toggleRepeatMode: () => setRepeatMode((prev) => (prev + 1) % 3),
    formatTime
  };
};

export default usePlayback;