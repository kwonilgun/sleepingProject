/* eslint-disable react-hooks/exhaustive-deps */
// SleepAvgTimeModal.tsx
import React, { useEffect, useState } from 'react';
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
import { SleepRecord } from '../../Login/ProfileScreen';
import colors from '../../../styles/colors';
import { height, width } from '../../../assets/common/BaseValue';

interface SleepAvgTimeModalProps {
  isVisible: boolean;
  onClose: () => void;
  records: SleepRecord[];
  loading: boolean;
}

const SleepAvgTimeModal: React.FC<SleepAvgTimeModalProps> = ({
  isVisible,
  onClose,
  records,
  loading,
}) => {

  const [monthlyAverageDurations, setMonthlyAverageDurations] = useState<Record<string, string>>({});

//   console.log('records, loading', records, loading);

  useEffect(()=> {
    if(records.length > 0){
        const result = calculateAverageSleepDuration();
        console.log('result', result);
        setMonthlyAverageDurations(result);
    }
    else{
        console.log('SleepAvgTimeModal, useEffect, loading ...');
    }

  }, []);


  // Function to calculate average sleep duration per month
  const calculateAverageSleepDuration = () => {
    const monthlyDurations: { [key: string]: number[] } = {};

    records.forEach(record => {
      if (record.start_time && record.end_time) {
        const recordDate = new Date(record.record_date);
        const yearMonth = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}`;

        // Create Date objects for start and end times
        const startTime = new Date(record.start_time);
        const endTime = new Date(record.end_time);

        // Calculate duration in milliseconds
        const durationMs = endTime.getTime() - startTime.getTime();

        // Convert duration to seconds (for more granular display)
        const durationSeconds = durationMs / 1000;

        if (!monthlyDurations[yearMonth]) {
          monthlyDurations[yearMonth] = [];
        }
        monthlyDurations[yearMonth].push(durationSeconds);
        // console.log('monthlyDurations = ', monthlyDurations);
      }
    });

    const averageDurations: { [key: string]: string } = {};
    for (const month in monthlyDurations) {
      const totalSeconds = monthlyDurations[month].reduce((sum, time) => sum + time, 0);
      const averageTotalSeconds = totalSeconds / monthlyDurations[month].length;

      const avgMinutes = Math.floor(averageTotalSeconds / 60);
      const avgSeconds = Math.round(averageTotalSeconds % 60);

      let formattedAvgDuration: string;
    // Format as "MM분 SS초", if minutes are 0, show only seconds
      if (avgMinutes === 0) {
        formattedAvgDuration = `${avgSeconds.toString().padStart(2, '0')}초`;
      } else {
        formattedAvgDuration = `${avgMinutes.toString().padStart(2, '0')}분 ${avgSeconds.toString().padStart(2, '0')}초`;
      }
      averageDurations[month] = formattedAvgDuration;
      console.log('averageDuration = ', averageDurations);
    }
    return averageDurations;
  };

//   const monthlyAverageDurations = calculateAverageSleepDuration();

//   console.log('monthlyAverageDurations = ', monthlyAverageDurations);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>월별 평균 입면 시간</Text>
          {/* {loading ? (
            <ActivityIndicator size="large" color={colors.blue} />
          ) : ( */}
            <ScrollView style={styles.scrollView}>
              {Object.keys(monthlyAverageDurations).length > 0 ? (
                Object.entries(monthlyAverageDurations)
                  .sort(([a], [b]) => b.localeCompare(a)) // Sort by month descending
                  .map(([month, avgDuration]) => (
                    <View key={month} style={styles.recordItem}>
                      <Text style={styles.recordDate}>{month}</Text>
                      <Text style={styles.recordTime}>{avgDuration}</Text>
                    </View>
                  ))
              ) : (
                <Text style={styles.noRecordsText}>
                  표시할 평균 수면 시간이 없습니다.
                </Text>
              )}
            </ScrollView>
          {/* )} */}

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.8,
    maxHeight: height * 0.7,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: RFPercentage(2),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: RFPercentage(2.8),
    fontWeight: 'bold',
    marginBottom: RFPercentage(2),
    color: colors.black,
  },
  scrollView: {
    width: '100%',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default SleepAvgTimeModal;