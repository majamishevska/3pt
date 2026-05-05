import * as Print from 'expo-print';
import { Asset } from 'expo-asset';
import { readAsStringAsync } from 'expo-file-system/legacy';
import type { CycleEntry } from '../utils/types';
import type { AppSettings } from '../utils/settingsStorage';
import { buildPeriodCalendarHtml } from './templates/periodCalendar';
import { copyFileToExports } from '../utils/writeExportFile';

function modulePngToDataUri(mod: number): Promise<string | null> {
  return (async () => {
    try {
      const asset = Asset.fromModule(mod);
      await asset.downloadAsync();
      if (!asset.localUri) return null;
      const b64 = await readAsStringAsync(asset.localUri, { encoding: 'base64' as any });
      return `data:image/png;base64,${b64}`;
    } catch {
      return null;
    }
  })();
}

export async function generatePeriodCalendarPdf(args: {
  settings: AppSettings;
  entries: CycleEntry[];
  now?: Date;
}): Promise<{ fileUri: string; fileName: string; folderUri: string }> {
  const now = args.now ?? new Date();
  // Use the same proven asset path as the PIN logo layers.
  const logoDataUri = await modulePngToDataUri(require('../../assets/images/3pt-logo.png'));
  const { html, fileName } = await buildPeriodCalendarHtml({
    spec: { kind: 'periodTrackingCalendar' },
    settings: args.settings,
    entries: args.entries,
    logoDataUri,
    now,
  });

  const printed = await Print.printToFileAsync({ html, base64: false });
  // Save a copy under Documents/exports with a friendly filename.
  return await copyFileToExports(printed.uri, fileName);
}

