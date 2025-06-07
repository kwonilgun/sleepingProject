import {useEffect} from 'react';

export function insertDashNumber(
  phone: string,
  setPhone: (item: string) => {},
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks

  if (phone.length === 11) {
    setPhone(phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'));
  }
  if (phone.length === 13) {
    setPhone(
      phone.replace(/-/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'),
    );
  }
}

export function returnDashNumber(phone: string) {
  if (phone.length === 11) {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (phone.length === 13) {
    return phone.replace(/-/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else {
    return phone;
  }
}
