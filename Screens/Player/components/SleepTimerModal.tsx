import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFPercentage } from 'react-native-responsive-fontsize';

interface SleepTimerModalProps {
  isVisible: boolean;
  onClose: () => void;
  setAfterSleepTimer: (minutes: number) => void;
  currentSelectedTime: number; // To show the currently active selection
}

const sleepTimerOptions = [0.1, 1, 5, 10, 15, 20, 30]; // Time options in minutes

const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isVisible,
  onClose,
  setAfterSleepTimer,
  currentSelectedTime,
}) => {
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
                currentSelectedTime === minutes && styles.sleepTimerOptionButtonActive,
              ]}
              onPress={() => {
                setAfterSleepTimer(minutes);
                onClose(); // Close modal after selection
              }}
            >
              <Text style={styles.sleepTimerOptionButtonText}>{minutes}분</Text>
              {currentSelectedTime === minutes && (
                <MaterialIcon name="check" size={24} color="green" style={styles.checkmarkIcon} />
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.sleepTimerOptionButton, styles.sleepTimerOptionButtonClose]}
            onPress={onClose}
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