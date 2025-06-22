import { StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import colors from '../styles/colors'; // Adjust path as necessary
import { width } from '../styles/responsiveSize'; // Adjust path as necessary

export const playerStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.lightGrey,
  },
  title: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  nowPlaying: {
    fontSize: RFPercentage(2.5),
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#34495e',
  },
  label: {
    marginTop: 20,
    marginBottom: 5,
    fontSize: RFPercentage(2),
    color: '#333',
  },
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
  sleepModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  sleepModeButtonActive: {
    backgroundColor: '#28a745', // Green when active
  },
  sleepModeButtonInactive: {
    backgroundColor: '#6c757d', // Grey when inactive
  },
  sleepModeButtonText: {
    color: 'white',
    fontSize: RFPercentage(2.2),
    marginLeft: 10,
    fontWeight: 'bold',
  },
  headerIcon: {
    height: RFPercentage(8),
    width: RFPercentage(10),
    marginTop: RFPercentage(2),
    color: colors.black,
    fontSize: RFPercentage(5),
    fontWeight: 'bold',
  },
});