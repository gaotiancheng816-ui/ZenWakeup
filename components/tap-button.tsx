import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { playPageTurn } from '../utils/sounds';

export function TapButton({ onPress, ...props }: TouchableOpacityProps) {
  return (
    <TouchableOpacity
      {...props}
      onPress={(e) => {
        playPageTurn();
        onPress?.(e);
      }}
    />
  );
}
