# Building your APK with Capacitor

I've configured your project with Capacitor! Since building an APK requires the Android SDK and Android Studio, you'll need to run the final steps on your local machine.

## Prerequisites
1. **Node.js** installed on your computer.
2. **Android Studio** installed and configured.

## Steps to Build the APK

1. **Download your project code** to your local machine.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Build the web project**:
   ```bash
   npm run build
   ```
4. **Add the Android platform** (only needed once):
   ```bash
   npx cap add android
   ```
5. **Sync the code to Android**:
   ```bash
   npx cap sync
   ```
6. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```
7. **In Android Studio**:
   - Wait for Gradle to finish syncing.
   - Go to `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`.
   - Once finished, a notification will appear with a link to the folder containing your `app-debug.apk`.

## Updating the App
Whenever you make changes to the code:
1. `npm run build`
2. `npx cap sync`
3. Build the APK again in Android Studio.
