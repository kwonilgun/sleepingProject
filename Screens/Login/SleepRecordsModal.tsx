import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import colors from '../../styles/colors';
import GlobalStyles from '../../styles/GlobalStyles';
import { width } from '../../assets/common/BaseValue';

interface SleepRecord {
  record_date: string; // YYYY-MM-DD format
  start_time: string | null;
  end_time: string | null;
}

interface SleepRecordsModalProps {
  isVisible: boolean;
  onClose: () => void;
  records: SleepRecord[];
  loading: boolean;
}

const SleepRecordsModal: React.FC<SleepRecordsModalProps> = ({ isVisible, onClose, records, loading }) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // State to store the selected month (YYYY-MM)
  const [monthlyRecords, setMonthlyRecords] = useState<Record<string, SleepRecord[]>>({});

  useEffect(() => {
    if (records.length > 0) {
      const groupedRecords: Record<string, SleepRecord[]> = records.reduce((acc, record) => {
        const month = record.record_date.substring(0, 7); // Extract YYYY-MM
        if (!acc[month]) {
          acc[month] = [];
        }
        acc[month].push(record);
        return acc;
      }, {} as Record<string, SleepRecord[]>);
      setMonthlyRecords(groupedRecords);
    } else {
      setMonthlyRecords({});
    }
    // Reset selected month when modal opens or records change
    setSelectedMonth(null);
  }, [records]);

  const calculateSleepDuration = (startTime: string | null, endTime: string | null, recordDate: string): string => {
    if (!startTime || !endTime) {
      return 'N/A';
    }

    try {
      // Create Date objects using the record_date to handle overnight sleep correctly
      // We assume start_time is on record_date
       console.log('startDate = ', startTime.toString());
      console.log('endDate = ', endTime.toString());
      const startDate = new Date(startTime);
      let endDate = new Date(endTime);
      console.log('startDate = ', startDate.toString());
      console.log('endDate = ', endDate.toString());


      // If end_time is earlier than start_time, it means sleep crossed midnight
      if (endDate.getTime() < startDate.getTime()) {
        endDate = new Date(`${recordDate}T${endTime}:00`);
        endDate.setDate(endDate.getDate() + 1); // Add a day to the end_date
      }

      const durationMs = endDate.getTime() - startDate.getTime();
      console.log('durationMs = ', durationMs);
      if (durationMs < 0) { // Should not happen with the above logic, but a safeguard
        return 'Invalid Time';
      }

      // Calculate total seconds
      const totalSeconds = Math.floor(durationMs / 1000);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return `${hours ? hours + '시간' : ''} ${minutes ? minutes + '분' : ''} ${seconds}초`;
    } catch (error) {
      console.error('Error calculating sleep duration:', error);
      return '계산 오류';
    }
  };

  const isEndTimeBeforeStartTime = (startTime: string | null, endTime: string | null): boolean => {
    if (!startTime || !endTime) {
      return false;
    }
    try {
      const startDateTime = new Date(`${startTime}`);
      const endDateTime = new Date(`${endTime}`);
      return endDateTime.getTime() < startDateTime.getTime();
    } catch (error) {
      console.error('Error comparing times:', error);
      return false;
    }
  };


  const renderMonthItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.monthItem}
      onPress={() => setSelectedMonth(item)}
    >
      <Text style={styles.monthText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderDayItem = ({ item }: { item: SleepRecord }) =>{
    const shouldHideEndTime = isEndTimeBeforeStartTime(item.start_time, item.end_time);

    return (
      <View style={styles.recordItem}>
        <Text style={styles.recordText}>날짜: {item.record_date}</Text>
        <Text style={styles.recordText}>시작 시간: {item.start_time || 'N/A'}</Text>
        {shouldHideEndTime ? (
          <Text style={styles.recordText}>종료 시간: {item.end_time ? 'N/A' : 'N/A'}</Text>
        ) : (
          <Text style={styles.recordText}>종료 시간: {item.end_time || 'N/A'}</Text>
        )}
        <Text style={styles.recordText}>
          입면 시간: {calculateSleepDuration(item.start_time, item.end_time, item.record_date)}
        </Text>
      </View>
    );

  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>수면 기록</Text>

          {loading ? (
            <Text style={styles.loadingText}>기록을 불러오는 중...</Text>
          ) : records.length === 0 ? (
            <Text style={styles.noRecordsText}>수면 기록이 없습니다.</Text>
          ) : (
            <>
              {selectedMonth ? (
                // Display daily records for the selected month
                <>
                  <Text style={styles.subTitle}>{selectedMonth} 기록</Text>
                  <FlatList
                    data={monthlyRecords[selectedMonth] || []}
                    renderItem={renderDayItem}
                    keyExtractor={(item, index) => `${item.record_date}-${index}`}
                    showsVerticalScrollIndicator={true}
                    style={styles.list}
                  />
                  <TouchableOpacity
                    style={GlobalStyles.buttonSmall}
                    onPress={() => setSelectedMonth(null)} // Go back to month list
                  >
                    <Text style={GlobalStyles.buttonTextStyle}>월별 목록으로 돌아가기</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Display monthly list
                <>
                  <Text style={styles.subTitle}>월별 기록</Text>
                  <FlatList
                    data={Object.keys(monthlyRecords).sort((a, b) => b.localeCompare(a))} // Sort months in descending order
                    renderItem={renderMonthItem}
                    keyExtractor={(item) => item}
                    showsVerticalScrollIndicator={true}
                    style={styles.list}
                  />
                  <TouchableOpacity
                    style={GlobalStyles.buttonSmall}
                    onPress={onClose}
                  >
                    <Text style={GlobalStyles.buttonTextStyle}>닫기</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.black,
  },
  subTitle: {
    fontSize: RFPercentage(2.5),
    fontWeight: '600',
    marginBottom: 15,
    color: colors.grey,
  },
  list: {
    width: '100%',
    maxHeight: '70%',
    marginBottom: 20,
  },
  monthItem: {
    backgroundColor: '#e0f7fa', // Lighter blue for month items
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#b2ebf2',
    alignItems: 'center',
  },
  monthText: {
    fontSize: RFPercentage(2.2),
    fontWeight: 'bold',
    color: colors.blue, // Primary color for month text
  },
  recordItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  recordText: {
    fontSize: RFPercentage(1.8),
    color: colors.black,
    marginBottom: 3,
  },
  loadingText: {
    fontSize: RFPercentage(2),
    color: colors.grey,
    marginBottom: 20,
  },
  noRecordsText: {
    fontSize: RFPercentage(2),
    color: colors.grey,
    marginBottom: 20,
  },
});

export default SleepRecordsModal;