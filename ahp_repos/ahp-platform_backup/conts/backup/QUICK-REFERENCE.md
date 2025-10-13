# 🚀 Quick Reference - AHP Backup System

## 📍 Key Locations
- **Backup Folder**: `C:\Users\ASUS\backup\`
- **Project Folder**: `C:\Users\ASUS\ahp-research-platform\`
- **GitHub Repository**: https://github.com/aebonlee/ahp-research-platform

## ⚡ Quick Recovery

### 1-Click Restore
```batch
C:\Users\ASUS\backup\scripts\restore-project.bat
```

### Git Tag Restore
```bash
cd C:\Users\ASUS\ahp-research-platform
git checkout v1.0-evaluation-test-complete
npm install && npm run build
```

### Archive Restore
```bash
cd C:\Users\ASUS
tar -xzf backup/stable-versions/v1.0-evaluation-test-complete-20250829/v1.0-evaluation-test-complete-20250829-source.tar.gz
```

## 📊 Current Status
- **Version**: v1.0-evaluation-test-complete
- **Date**: 2025-08-29
- **Build**: 331.93 kB (gzipped)
- **Status**: ✅ Production Ready

## 🔧 Post-Recovery Checklist
- [ ] `npm install` completed
- [ ] `npm run build` successful  
- [ ] Evaluation test system works
- [ ] All features functional

## 📁 Backup Structure
```
backup/
├── ahp-project/         # Complete backups
├── stable-versions/     # Stable releases
├── source-archives/     # Development snapshots  
├── documentation/       # Docs & metadata
└── scripts/            # Recovery tools
```

## 🆘 Emergency Recovery
If everything fails:
1. Download from GitHub: https://github.com/aebonlee/ahp-research-platform
2. Or use latest complete backup in `backup/ahp-project/`