// SleepRecordsModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import colors from '../../styles/colors';
import GlobalStyles from '../../styles/GlobalStyles';
import { width } from '../../assets/common/BaseValue';

interface SleepRecord {
  record_date: string;
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
  const renderItem = ({ item }: { item: SleepRecord }) => (
    <View style={styles.recordItem}>
      <Text style={styles.recordText}>날짜: {item.record_date}</Text>
      <Text style={styles.recordText}>시작 시간: {item.start_time || 'N/A'}</Text>
      <Text style={styles.recordText}>종료 시간: {item.end_time || 'N/A'}</Text>
    </View>
  );

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
          ) : records.length > 0 ? (
            <FlatList
              data={records}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.record_date}-${index}`}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />
          ) : (
            <Text style={styles.noRecordsText}>수면 기록이 없습니다.</Text>
          )}

          <TouchableOpacity
            style={GlobalStyles.buttonSmall}
            onPress={onClose}
          >
            <Text style={GlobalStyles.buttonTextStyle}>닫기</Text>
          </TouchableOpacity>
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
    width: width * 0.9, // Adjust width as needed
    maxHeight: '80%', // Limit height to prevent overflow
  },
  modalTitle: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.black,
  },
  list: {
    width: '100%',
    maxHeight: '70%', // Adjust to fit content within modal
    marginBottom: 20,
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