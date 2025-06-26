// src/screens/PlayerScreen/hooks/usePlayerControls.ts
import { useState } from 'react';
import TrackPlayer, { State } from 'react-native-track-player';
import { useProgress, RepeatMode } from 'react-native-track-player'; // Import useProgress

// enum RepeatMode {
//   Off,
//   RepeatOne,
//   RepeatAll,
// }

interface UsePlayerControlsProps {
  currentTrackIndex: number;
  selectedTracksLength: number;
  setCurrentTrackIndex: (index: number) => void;
  // Add any other props from PlayerScreen that these functions might need
}

export const usePlayerControls = ({
  currentTrackIndex,
  selectedTracksLength,
  setCurrentTrackIndex,
}: UsePlayerControlsProps) => {
  const progress = useProgress(); // Use useProgress here to get current position
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.Off);
  const [volume, setVolume] = useState<number>(0.3);
  const [prevVolume, setPrevVolume] = useState<number>(1.0); // To store volume before muting
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const togglePlayback = async () => {
    const currentState = await TrackPlayer.getState();
    if (currentState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const handleSkipPrevious = async () => {
    const currentPosition = progress.position; // Access progress from the hook
    if (currentPosition > 3 || currentTrackIndex === 0) {
      await TrackPlayer.seekTo(0);
    } else if (currentTrackIndex > 0) {
      await TrackPlayer.skipToPrevious();
    }
  };

  const handleSkipNext = async () => {
    if (currentTrackIndex < selectedTracksLength - 1) {
      await TrackPlayer.skipToNext();
    } else {
      if (repeatMode === RepeatMode.Queue) {
        // TrackPlayerRepeatMode.Queue is already handled by TrackPlayer
      } else {
        await TrackPlayer.pause();
        await TrackPlayer.seekTo(0);
        setCurrentTrackIndex(0);
      }
    }
  };

  const toggleRepeatMode = () => {
    setRepeatMode((prevMode) => {
      switch (prevMode) {
        case RepeatMode.Off:
          return RepeatMode.Track;
        case RepeatMode.Track:
          return RepeatMode.Queue;
        case RepeatMode.Queue:
          return RepeatMode.Off;
        default:
          return RepeatMode.Off;
      }
    });
  };

  const getRepeatButtonIcon = () => {
    switch (repeatMode) {
      case RepeatMode.Off:
        return 'repeat-off';
      case RepeatMode.Track:
        return 'repeat-once';
      case RepeatMode.Queue:
        return 'repeat';
      default:
        return 'undo';
    }
  };

  const getRepeatButtonColor = () => {
    switch (repeatMode) {
      case RepeatMode.Off:
        return '#800080'; // Purple for off
      case RepeatMode.Track:
        return '#FFA500'; // Orange for repeat one
      case RepeatMode.Queue:
        return '#007bff'; // Blue for repeat all
      default:
        return '#800080';
    }
  };

  const toggleMute = async () => {
    if (isMuted) {
      // Unmute: restore to previous volume
      await TrackPlayer.setVolume(prevVolume);
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      // Mute: store current volume and set to 0
      setPrevVolume(volume); // Save current volume before muting
      await TrackPlayer.setVolume(0);
      setVolume(0);
      setIsMuted(true);
    }
  };

  return {
    repeatMode,
    volume,
    isMuted,
    setVolume,
    setRepeatMode,
    togglePlayback,
    handleSkipPrevious,
    handleSkipNext,
    toggleRepeatMode,
    getRepeatButtonIcon,
    getRepeatButtonColor,
    toggleMute,
    // RepeatMode, // Export RepeatMode enum if needed in PlayerScreen
  };
};