# 3PT - Privacy-Preserving Period Tracker

<p align="center">
  <img src="/assets/images/3pt-logo.png" alt="3PT logo" width="300" />
</p>

*3PT* is a privacy-first, zero-knowledge period tracking application developed as a final project for CSCI 1952B. 

In a post-*Dobbs* landscape where reproductive data is increasingly weaponized by data brokers and surveillance capitalism, *3PT* shifts the power dynamic back to the user. It utilizes a strict local-only architecture to ensure absolute data sovereignty, informational self-determination, and a frictionless right to be forgotten.


## Getting Started


**Optional deployed Vercel link:** https://3pt-tracker.vercel.app
**Note:** Local deployment is preferred; see the setup instructions above.

### 1. Installation
Clone the repository and install the dependencies:

```bash
npm install
```

### 2. Running the App

Start the Expo development server:

```bash
npx expo start (or npx expo start -c)
press i to open iOS simulator
```
 ⁠
You can then run the app on an iOS Simulator, Android Emulator, or a physical device via the Expo Go app.

### 3. Accessing the App

To ensure privacy against physical device snooping, the app launches with a lock screen.
**The PIN to unlock and access the app is *1952*.**

## Key Features
- ⁠*Zero Cloud Storage:* 100% of cycle data and notes are saved locally on-device. There is no central server to be breached or subpoenaed.

- ⁠*Account-Free Access:* No email, password, or identity linking is required to start tracking, ensuring zero friction and absolute anonymity.

- ⁠*Data Sovereignty (Export/Import):* Built-in tools allow you to instantly export your cycle history as universally readable JSON or CSV files to avoid vendor lock-in.

- ⁠*The Right to be Forgotten:* A permanently visible "Delete All Data" button instantly drops your local database, guaranteeing permanent erasure without arbitrary 30-day corporate wait periods.

- ⁠*Fully Offline:* The app functions entirely without an internet connection, physically severing the data-sharing pipeline.

## Tech Stack
⁠React Native •⁠  ⁠Expo •⁠  ⁠TypeScript •⁠  ⁠AsyncStorage (for local, on-device persistence)

## Authors

    Maja Mishevska
    Yaaqub Kamarulzaman