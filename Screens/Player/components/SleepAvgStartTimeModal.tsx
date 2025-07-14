// SleepAvgStartTimeModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
// Assuming SleepRecord and common values are correctly imported from your project structure
// You might need to adjust these paths based on your actual project
import colors from '../../../styles/colors';
import { height, width } from '../../../assets/common/BaseValue';
import { SleepRecord } from '../../Login/ProfileScreen';

// // Define the interface for SleepRecord, consistent with your original code
// interface SleepRecord {
//   record_date: string;
//   start_time: string; // e.g., "2023-10-26T23:00:00.000Z"
//   end_time: string;   // e.g., "2023-10-27T07:00:00.000Z"
// }

interface SleepAvgStartTimeModalProps {
  isVisible: boolean;
  onClose: () => void;
  records: SleepRecord[];
  loading: boolean;
}

const SleepAvgStartTimeModal: React.FC<SleepAvgStartTimeModalProps> = ({
  isVisible,
  onClose,
  records,
  loading,
}) => {
  /**
   * Calculates the average sleep start time for each month from the provided sleep records.
   * The average is calculated by converting each start time to seconds from midnight,
   * averaging these seconds per month, and then converting back to a formatted HH:MM:SS string.
   * @returns An object where keys are "YYYY-MM" and values are formatted average start times.
   */
  const calculateAverageSleepStartTime = () => {
    // Stores the sum of seconds from midnight for each start time, grouped by month
    const monthlyStartTimesInSeconds: { [key: string]: number[] } = {};

    records.forEach(record => {
      // Ensure start_time exists before processing
      if (record.start_time) {
        const recordDate = new Date(record.record_date);
        // Format month as YYYY-MM (e.g., "2023-10")
        const yearMonth = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}`;

        // Create a Date object from the start_time string
        const startTime = new Date(record.start_time);

        // Calculate total seconds from midnight for the start time
        const hours = startTime.getHours();
        const minutes = startTime.getMinutes();
        const seconds = startTime.getSeconds();
        const totalSecondsFromMidnight = (hours * 3600) + (minutes * 60) + seconds;

        // Initialize array for the month if it doesn't exist
        if (!monthlyStartTimesInSeconds[yearMonth]) {
          monthlyStartTimesInSeconds[yearMonth] = [];
        }
        // Add the calculated seconds to the respective month's array
        monthlyStartTimesInSeconds[yearMonth].push(totalSecondsFromMidnight);
      }
    });

    const averageStartTimes: { [key: string]: string } = {};
    // Iterate through each month's collected start times
    for (const month in monthlyStartTimesInSeconds) {
      // Sum all seconds from midnight for the current month
      const totalSeconds = monthlyStartTimesInSeconds[month].reduce((sum, time) => sum + time, 0);
      // Calculate the average seconds from midnight for the month
      const averageTotalSeconds = totalSeconds / monthlyStartTimesInSeconds[month].length;

      // Convert average seconds back into hours, minutes, and seconds
      const avgHours = Math.floor(averageTotalSeconds / 3600);
      const avgMinutes = Math.floor((averageTotalSeconds % 3600) / 60);
      const avgSeconds = Math.round(averageTotalSeconds % 60); // Round seconds for cleaner display

      // Format the average time as HH:MM:SS, padding with leading zeros if necessary
      const formattedAvgTime =
        `${avgHours.toString().padStart(2, '0')}:` +
        `${avgMinutes.toString().padStart(2, '0')}:` +
        `${avgSeconds.toString().padStart(2, '0')}`;

      averageStartTimes[month] = formattedAvgTime;
    }
    return averageStartTimes;
  };

  // Calculate the monthly average start times when the component renders or props change
  const monthlyAverageStartTimes = calculateAverageSleepStartTime();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // Handles Android back button press
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Title */}
          <Text style={styles.modalTitle}>월별 평균 입면 시작 시간</Text>

          {/* Loading Indicator or Content */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.blue} />
          ) : (
            <ScrollView style={styles.scrollView}>
              {/* Check if there are any records to display */}
              {Object.keys(monthlyAverageStartTimes).length > 0 ? (
                // Sort months in descending order (most recent first)
                Object.entries(monthlyAverageStartTimes)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([month, avgStartTime]) => (
                    // Display each month's average start time
                    <View key={month} style={styles.recordItem}>
                      <Text style={styles.recordDate}>{month}</Text>
                      <Text style={styles.recordTime}>{avgStartTime}</Text>
                    </View>
                  ))
              ) : (
                // Message when no records are available
                <Text style={styles.noRecordsText}>
                  표시할 평균 입면 시작 시간이 없습니다.
                </Text>
              )}
            </ScrollView>
          )}

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
  modalContainer: {
    width: width * 0.8, // 80% of screen width
    maxHeight: height * 0.7, // Max 70% of screen height
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: RFPercentage(2), // Responsive padding
    alignItems: 'center',
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Shadow for Android
  },
  modalTitle: {
    fontSize: RFPercentage(2.8), // Responsive font size
    fontWeight: 'bold',
    marginBottom: RFPercentage(2),
    color: colors.black,
  },
  scrollView: {
    width: '100%', // Take full width of the container
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute items evenly
    paddingVertical: RFPercentage(1),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    width: '100%',
  },
  recordDate: {
    fontSize: RFPercentage(2.2),
    fontWeight: 'bold',
    color: colors.black,
  },
  recordTime: {
    fontSize: RFPercentage(2.2),
    color: colors.black,
  },
  noRecordsText: {
    fontSize: RFPercentage(2),
    color: colors.grey,
    textAlign: 'center',
    marginTop: RFPercentage(2),
  },
  closeButton: {
    marginTop: RFPercentage(3),
    backgroundColor: colors.blue,
    paddingVertical: RFPercentage(1.2),
    paddingHorizontal: RFPercentage(3),
    borderRadius: 8,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: RFPercentage(2.2),
    fontWeight: 'bold',
  },
});

export default SleepAvgStartTimeModal;
