
# 🌿 HostFlow CRM - Maintenance & Sync Guide

Welcome to your Airbnb Management Engine. This file explains how to keep your app running and your data safe.

## 🚀 How to Sync your Code to GitHub
GitHub is for your **Website Code**. It does not sync automatically like Google Drive. To update your live website, follow these steps:

1. **Open Terminal** in this folder.
2. **Add changes**: `git add .`
3. **Save snapshot**: `git commit -m "Describe your changes here"`
4. **Push to Live**: `git push origin main`

*Your website (GitHub Pages) will update automatically within 2-3 minutes of the push.*

---

## 🔒 How Data Sync Works (The Cloud Vault)
Your **Guest Records, Bookings, and Financials** are NOT stored on GitHub for security reasons. They are stored in an encrypted **Cloud Vault**.

### How to access your data on a new device:
1. Go to your HostFlow URL.
2. Enter the **exact same Email and Password** you used to create the account.
3. The app will "Handshake" with the Cloud Vault and pull all your records down instantly.

### Safety Tips:
- **Don't lose your password**: Your password is the encryption key. If you lose it, we cannot recover the vault.
- **Auto-Sync**: Look for the 🟢 green "Encrypted" badge in the top right. If it's 🟡 amber, it means it's still trying to reach the vault.
- **Manual Backups**: In the **Staff Portal**, click **"Desktop Backup (.json)"** once a week. This saves a physical file of all your data to your hard drive just in case.

---

## 🛠 Running Locally
If you are running this from your local drive:
1. Open the folder in **VS Code**.
2. Click **"Go Live"** (requires the Live Server extension).
3. The app will run at `http://127.0.0.1:5500`.

---

## 🏗 Project Architecture
- `App.tsx`: The main engine.
- `services/cloudService.ts`: Manages the connection to the Cloud Vault.
- `components/Auth.tsx`: Manages your secure entry.
- `components/CheckInCounter.tsx`: Your guest registration desk.
