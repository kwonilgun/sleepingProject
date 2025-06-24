import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useSleepTimer } from '../../../context/store/SleepTimerContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SleepTimerModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const sleepTimerOptions = [0.1, 1, 5, 10, 15, 20, 30]; // Time options in minutes

const SLEEP_DELAY_KEY = 'sleepTimerInitialDelay'; // Key for AsyncStorage

const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isVisible, onClose }) => {
  const { initialSleepDelay, setInitialSleepDelay } = useSleepTimer(); // Context 훅 사용
  // const [isLoading, setIsLoading] = useState<boolean>(true);

  // // Effect to load the sleep delay from AsyncStorage when the component mounts
    // useEffect(() => {
    //   const loadSleepDelay = async () => {

    //     try {
    //       const storedValue = await AsyncStorage.getItem(SLEEP_DELAY_KEY);
    //        console.log('SleepTimerModal, loadSleepDelay storeValue', storedValue);
    //       if (storedValue !== null) {
    //         // If a value is found, parse it and set it
    //         const parsedValue = parseFloat(storedValue);
    //         setInitialSleepDelay(parsedValue);
    //       } else {
    //         // If no value is found, set the default to 0.1

    //         setInitialSleepDelay(0.1);
    //         // Also save this default value to storage immediately
    //         await AsyncStorage.setItem(SLEEP_DELAY_KEY, '0.1');
    //       }
    //     } catch (error) {
    //       console.error('Failed to load sleep delay from storage:', error);
    //       // Fallback to default if loading fails
    //       setInitialSleepDelay(0.1);
    //     } finally {
    //       setIsLoading(false); // Loading is complete
    //     }
    //   };
    //   loadSleepDelay();
    // }, []); // Run only once on mount

  // Save the selected value when closing the modal
  const handleClose = async () => {
    try {
      await AsyncStorage.setItem(SLEEP_DELAY_KEY, initialSleepDelay.toString());
      console.log('Sleep delay saved:', initialSleepDelay);
    } catch (error) {
      console.error('Failed to save sleep delay:', error);
    }
    onClose();
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sleepTimerOptionsContainer}>
          <Text style={styles.sleepTimerOptionsTitle}>수면 체크 시간:</Text>
          {sleepTimerOptions.map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.sleepTimerOptionButton,
                // 활성화된 버튼 스타일은 Context의 initialSleepDelay 값과 비교하여 적용
                initialSleepDelay === minutes && styles.sleepTimerOptionButtonActive,
              ]}
              onPress={() => {
                setInitialSleepDelay(minutes); // Context의 값 업데이트
                // onClose(); // 모달을 닫고 싶다면 주석 해제
              }}
            >
              <Text style={styles.sleepTimerOptionButtonText}>{minutes}분</Text>
              {initialSleepDelay === minutes && ( // Context의 값과 비교
                <MaterialIcon name="check" size={24} color="green" style={styles.checkmarkIcon} />
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.sleepTimerOptionButton, styles.sleepTimerOptionButtonClose]}
            onPress={handleClose}
          >
            <Text style={styles.sleepTimerOptionButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sleepTimerOptionsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  sleepTimerOptionsTitle: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  sleepTimerOptionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  sleepTimerOptionButtonActive: {
    backgroundColor: '#e6ffe6', // Light green for active
    borderWidth: 1,
    borderColor: 'green',
  },
  sleepTimerOptionButtonText: {
    fontSize: RFPercentage(2),
    color: '#333',
  },
  sleepTimerOptionButtonClose: {
    marginTop: 15,
    backgroundColor: '#dc3545',
  },
  checkmarkIcon: {
    position: 'absolute',
    right: 15,
  },
});

export default SleepTimerModal;