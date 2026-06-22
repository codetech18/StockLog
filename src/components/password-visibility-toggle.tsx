import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { useAppTheme } from '@/lib/theme-context';

export function PasswordVisibilityToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onToggle} hitSlop={8}>
      <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.inkFaint} />
    </Pressable>
  );
}
