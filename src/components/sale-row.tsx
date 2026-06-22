import { StyleSheet, View } from 'react-native';

import { Money } from '@/components/money';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatTime } from '@/lib/date';
import { formatAmount } from '@/lib/money';
import type { SaleWithDevice } from '@/lib/types';

type SaleRowProps = {
  sale: SaleWithDevice;
  index: number;
};

export function SaleRow({ sale, index }: SaleRowProps) {
  const deviceName = sale.inventory?.device_name ?? 'Unknown device';
  const profit = sale.inventory ? sale.selling_price - sale.inventory.cost_price : null;
  const meta = [sale.buyer_name, formatTime(sale.created_at), sale.payment_method.toLowerCase()]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.row}>
      <ThemedText type="metaMono" color="lineNumber" style={styles.lineNumber}>
        {String(index + 1).padStart(2, '0')}
      </ThemedText>
      <View style={styles.rowMain}>
        <ThemedText type="rowPrimary">{deviceName}</ThemedText>
        <ThemedText type="metaMono" color="inkFaint">
          {meta}
        </ThemedText>
      </View>
      <View style={styles.rowFigures}>
        <Money amount={sale.selling_price} type="figure" />
        {profit !== null ? (
          <ThemedText type="metaMono" color="accentText">
            +₦{formatAmount(profit)}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 13, gap: Spacing.two },
  lineNumber: { width: 16, paddingTop: 2 },
  rowMain: { flex: 1, gap: Spacing.half },
  rowFigures: { alignItems: 'flex-end', gap: Spacing.half },
});
