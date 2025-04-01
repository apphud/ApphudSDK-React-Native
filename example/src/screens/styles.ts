import { StyleSheet } from 'react-native';

export const common = StyleSheet.create({
  th: {
    fontWeight: 'bold',
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: '#c4c4c4',
    borderLeftWidth: 1,
    borderLeftColor: '#c4c4c4',
    marginBottom: 16,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  col: {
    flex: 1,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#c4c4c4',
    borderRightWidth: 1,
    borderRightColor: '#c4c4c4',
  },
});
