import { getInfoAsync, makeDirectoryAsync, writeAsStringAsync, documentDirectory } from 'expo-file-system/legacy';

const EXPORT_SUBDIR = 'exports';

export type ExportWriteResult = {
  fileUri: string;
  fileName: string;
  folderUri: string;
};

export async function writeExportToDocuments(payload: string, ext: 'json' | 'csv'): Promise<ExportWriteResult> {
  const base = documentDirectory;
  if (!base) {
    throw new Error('Document storage is not available on this device.');
  }
  const folderUri = `${base}${EXPORT_SUBDIR}`;
  try {
    const info = await getInfoAsync(folderUri);
    if (!info.exists) {
      await makeDirectoryAsync(folderUri, { intermediates: true });
    }
  } catch {
    await makeDirectoryAsync(folderUri, { intermediates: true });
  }

  const safeStamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `cycle-export-${safeStamp}.${ext}`;
  const fileUri = `${folderUri}/${fileName}`;

  await writeAsStringAsync(fileUri, payload);

  return { fileUri, fileName, folderUri };
}

export function friendlyDocumentsHint(appName: string): string {
  return `On your device this usually appears in the Files app under ${appName}, or in this app’s private Documents area (not the same as your Photos library).`;
}
