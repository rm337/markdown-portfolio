INKSPIRATIONS STUDIOS - COMPLETE PHOTO AND LIGHTROOM INDEX

This repaired package is compatible with Windows PowerShell 5.1.

NORMAL USE
1. Keep RUN_PHOTO_INDEX.cmd and PhotoIndex.ps1 together.
2. Double-click RUN_PHOTO_INDEX.cmd.
3. Leave the window open. It shows live drive, folder, file, and match counts.
4. The window remains open after success or failure.
5. Open PHOTO_INDEX_OUTPUT\LATEST_RUN.txt for the exact timestamped result folder.

CONTINUOUS RESULTS
- Reports are flushed every 250 matching records.
- Status and current paths are logged during the scan.
- An interruption does not erase rows already written.
- Every run uses a new RUN_yyyyMMdd_HHmmss folder; earlier results are preserved.

REPORTS
- 00_READ_ME_FIRST.txt: readable result, safety statement, and verification
- 01_COMPLETE_PHOTO_AND_LIGHTROOM_INDEX.csv: all matching records
- 02_ALL_PHOTOS.csv: photographs, RAW files, and artwork
- 03_LIGHTROOM_CATALOGS_AND_METADATA.csv: catalogs, previews, bundles, XMP, and support data
- 04_POSSIBLE_AI_REVIEW_ONLY.csv: conservative filename/path review flags
- 05_SCAN_NOTES.csv: inaccessible paths, skipped reparse points, and warnings
- 06_DRIVE_SUMMARY.csv: per-drive totals
- 07_EXTENSION_SUMMARY.csv: extension totals
- PHOTO_GALLERY.html: private searchable visual gallery
- SCAN_STATUS.log: durable live-progress history

SAFETY
- Mounted source drives are scanned read-only.
- The script does not move, rename, edit, delete, overwrite, or upload source files.
- The output folder is excluded from scanning.
- Reparse points are skipped to prevent loops.
- No indexed image is automatically approved for publication or sale.
- AI flags are review flags only. Robert makes every final decision.
