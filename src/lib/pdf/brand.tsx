import { Path, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import { PDF_COLOR } from './colors';

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 28, height: 28, borderRadius: 6, backgroundColor: PDF_COLOR.indigo, alignItems: 'center', justifyContent: 'center' },
  name: { marginLeft: 8, fontSize: 13, fontFamily: 'Helvetica-Bold' },
});

/** The Checkpoint IT Group mark (lucide ShieldCheck on indigo, as in the app) and name. */
export function PdfBrand({ name }: { name: string }) {
  return (
    <View style={styles.brand}>
      <View style={styles.logo}>
        <Svg viewBox="0 0 24 24" width={16} height={16}>
          <Path
            d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
            stroke={PDF_COLOR.white}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path d="m9 12 2 2 4-4" stroke={PDF_COLOR.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      </View>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}
