# Backup Files

## Current Backup
- **Date**: 2025-09-02
- **Archive**: ahp-platform-complete-backup-2025-09-02.tar.gz
- **Size**: 11M
- **Git Commit**: e827036
- **Restore Guide**: BACKUP_RESTORE_GUIDE.md

## Contents
- Complete source code (excluding node_modules, .git, build)
- All documentation (docs_03 folder)
- Configuration files
- Database migration files

## Quick Restore
```bash
cd backup
tar -xzf ahp-platform-complete-backup-2025-09-02.tar.gz
cd [extracted-folder]
npm install && cd backend && npm install
```
