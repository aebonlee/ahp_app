#!/usr/bin/env python3
"""
GitHub Repository Cleanup Script
- Close outdated pull requests
- Delete unused branches
"""

import requests
import json
import sys

# Repository configuration
REPO_OWNER = "aebonlee"
REPO_NAME = "ahp_app"
BASE_URL = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}"

# GitHub Personal Access Token (would need to be provided)
# TOKEN = "your_github_token_here"

def close_pull_requests():
    """Close all open pull requests except the latest one"""
    
    # PRs to close (based on our analysis)
    prs_to_close = [
        {"number": 5, "title": "Temp main replacement"},
        {"number": 4, "title": "Final merge complete"}, 
        {"number": 3, "title": "Merge feature ai management"},
        {"number": 2, "title": "Feature/ai management deploy"}
    ]
    
    print("🔧 Pull Requests to close:")
    for pr in prs_to_close:
        print(f"  - PR #{pr['number']}: {pr['title']}")
    
    print("\nNote: These PRs are outdated and their changes have been integrated into main.")
    print("Manual action required: Go to GitHub web interface to close these PRs.")

def delete_branches():
    """Delete unused branches"""
    
    # Branches to delete (keeping main, gh-pages, and our new fix branch)
    branches_to_delete = [
        "backup-main-structure",
        "feature/ai-management-deploy", 
        "final-merge-complete",
        "merge-feature-ai-management",
        "temp-main-replacement"
    ]
    
    print("🌿 Branches to delete:")
    for branch in branches_to_delete:
        print(f"  - {branch}")
    
    print("\nNote: These branches are no longer needed as their changes have been merged.")
    print("Manual action required: Delete these branches through GitHub web interface.")

def cleanup_summary():
    """Print cleanup summary"""
    print("\n" + "="*60)
    print("🧹 GITHUB REPOSITORY CLEANUP PLAN")
    print("="*60)
    
    close_pull_requests()
    print()
    delete_branches()
    
    print("\n" + "="*60)
    print("📋 MANUAL ACTIONS REQUIRED:")
    print("="*60)
    print("1. Go to https://github.com/aebonlee/ahp_app/pulls")
    print("2. Close PRs #2, #3, #4, #5 with comment: 'Changes integrated into main'")
    print("3. Go to https://github.com/aebonlee/ahp_app/branches")
    print("4. Delete the unused branches listed above")
    print("5. Keep only: main, gh-pages, fix/hierarchy-final-sync")
    print("\n✅ After cleanup, repository will be clean and organized!")

if __name__ == "__main__":
    cleanup_summary()