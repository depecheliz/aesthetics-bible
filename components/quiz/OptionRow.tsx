import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { colors, spacing } from '../../constants/theme';
type Props={label:string;selected:boolean;onPress:()=>void;multiSelect?:boolean};
export function OptionRow({label,selected,onPress,multiSelect=false}:Props){
 return <Pressable onPress={onPress} accessibilityRole={multiSelect?'checkbox':'radio'} accessibilityLabel={label}
  accessibilityState={multiSelect?{checked:selected}:{selected}} style={styles.row}>
  <ThemedText variant={selected?'displaySmall':'bodyLarge'} color={selected?colors.textPrimary:colors.textSecondary} style={styles.label}>{label}</ThemedText>
  <Feather name={selected?'check-circle':'circle'} size={18} color={selected?colors.accent:colors.border}/>
 </Pressable>;
}
const styles=StyleSheet.create({row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:spacing.md,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border},label:{flex:1,marginRight:spacing.sm}});
