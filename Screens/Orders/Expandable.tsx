/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

import isEmpty from '../../utils/isEmpty';
import { dateToKoreaDate } from '../../utils/time/dateToKoreaTime';
import { DataList, DataListItem } from './makeExpandable';
import { RFPercentage } from 'react-native-responsive-fontsize';

interface ExpandableProps {
  navigation: any;
  item: DataListItem;
  onClickFunction: () => void;
  actionFt: (id: string, props: any) => void;
  orders: DataList;
}

export const Expandable: React.FC<ExpandableProps> = ({
  navigation,
  item,
  onClickFunction,
  actionFt,
  orders,
}) => {
  const [layoutHeight, setLayoutHeight] = useState<number | null>(0);

  useFocusEffect(
    useCallback(() => {
      console.log('>>>>Expandable: useFocusEffect : 진입을 한다. .<<<<<');
      if (item.isExpanded) {
        setLayoutHeight(null);
      } else {
        setLayoutHeight(0);
      }
    }, [item.isExpanded]),
  );

   // 첫 번째 수신자와 주문번호를 가져옵니다.
  //  const firstSubtitle = !isEmpty(item.subtitle) ? item.subtitle[0] : null;

  return (
    <View>
      <TouchableOpacity activeOpacity={0.8} onPress={onClickFunction}>
        <Text style={styles.title}>{item.title} {item.isExpanded ? '  🔼' : '  🔽'}</Text>
      </TouchableOpacity>
      <View
        style={{
          height: layoutHeight,
          overflow: 'hidden',
        }}>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection: 'column'}}>
              <View style={styles.subtitleHeader}>
                <Text style={[styles.headerText, {width:RFPercentage(10), borderWidth:1, borderColor: 'black', marginLeft: RFPercentage(2)}]}>수신자</Text>
                <Text style={[styles.headerText, {width:RFPercentage(20), borderWidth:1, borderColor: 'black' }]}>주문날짜</Text>
                <Text style={[styles.headerText, {width:RFPercentage(20), borderWidth:1, borderColor: 'black' }]}>주문번호</Text>
                <Text style={[styles.headerText, {width:RFPercentage(20), borderWidth:1, borderColor: 'black' }]}>배송일정</Text>
              </View>
              {!isEmpty(item.subtitle) ? (
                item.subtitle.map((data, key) => (
                  // console.log('Expandable receiver name = ');
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      console.log('Expandable.tsx : 주문 상세 정보 누름');
                      navigation.navigate('UserMain', {
                        screen: 'OrderDetailScreen',
                        params: {
                          item: data,
                          actionFt: actionFt,
                          orders: orders,
                        },
                      });
                    }}>
                    <View style={styles.subtitleContainer}>
                      <Text style={styles.receiverName}>{data.receiverName} :</Text>
                      <Text style={styles.dateOrdered}>
                        {dateToKoreaDate(new Date(data.dateOrdered))}

                      </Text>
                      <Text style={styles.orderNumber}>
                        {' '}
                        {data.orderNumber}
                      </Text>
                      <Text style={[styles.orderNumber]}>
                        { data.deliveryDate === null ? '          미지정          ' : dateToKoreaDate(new Date(data.deliveryDate))}
                        </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noDataText}>데이타 없음</Text>
              )}


           </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  subtitleHeader: {
    flexDirection: 'row',
    alignItems: 'center',  // 중앙 정렬
    // justifyContent: 'space-between',
    marginVertical: 4,
    // borderBottomWidth: 1,
    // borderColor: 'black',
  },
  subtitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', // 중앙 정렬
    // justifyContent: 'space-between',
    marginVertical: 4,
    paddingHorizontal: RFPercentage(2),
  },
  headerText: {
    // flex: 1, // 동일한 비율 유지
    fontSize: RFPercentage(2),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  receiverName: {
    width: RFPercentage(10),
    fontSize: RFPercentage(2),
    textAlign: 'center',
    // paddingHorizontal: RFPercentage(1),
    borderColor: 'blue',
    borderWidth: 1,
  },
  dateOrdered: {
    fontSize: RFPercentage(2),
    color: '#555',
    textAlign: 'center',
    // paddingHorizontal: RFPercentage(1),
    width: RFPercentage(20),
    borderColor: 'blue',
    borderWidth: 1,
  },
  orderNumber: {
    fontSize: RFPercentage(2),
    color: '#555',
    textAlign: 'center',
    // paddingHorizontal: RFPercentage(1),
    width: RFPercentage(20),
    borderColor: 'red',
    borderWidth: 1,
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 8,
  },
});
