import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomText = ({ style, children }) => {
  return <Text style={[styles.defaultText, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: 'FredokaOne',
  },
});

export default CustomText;
