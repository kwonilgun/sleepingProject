import React from 'react';
import {Dimensions, View} from 'react-native';
import BadgeIcon, {BadgeIconProps} from './BadgeIcon';
import {useAuth} from '../../context/store/Context.Manager';

const ChatIcon: React.FC = () => {
  const {notifyState} = useAuth();

  const {width} = Dimensions.get('window');

  const badge: BadgeIconProps = {
    width: width * 0.07,
    top: -30,
    right: -30,
    msg: 'M',
  };

  return (
    <>
      {notifyState.isNotificationArrived === true ? (
        <View>{BadgeIcon(badge)}</View>
      ) : null}
    </>
  );
};

export default ChatIcon;
