# Challenge Fit - Manual Android Release Signing TODO

To fix the "signed in debug mode" error and successfully upload your package to the Google Play Store, please complete the following steps:

- [ ] **0. Configure Android Environment (Optional but Recommended)**
  I have already created a `local.properties` file to fix the current build error. To make this permanent for all projects, add these lines to your `~/.bashrc` (or `~/.zshrc`):
  ```bash
  export ANDROID_HOME=/home/tom/Unity/Hub/Editor/6000.4.8f1/Editor/Data/PlaybackEngines/AndroidPlayer/SDK
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

- [ ] **1. Generate a Release Keystore**
  Run this command in your terminal to create your unique production signing key:
  ```bash
  keytool -genkey -v -keystore user.keystore -alias challengefit-alias -keyalg RSA -keysize 2048 -validity 10000
  ```
  *Important: Keep the passwords you create safe and secure.*

- [ ] **2. Place the Keystore File**
  Move the generated `user.keystore` file into the following directory:
  `client/android/app/`

- [ ] **3. Configure Credentials in gradle.properties**
  Open `client/android/gradle.properties` and add the following lines at the bottom (replace the placeholders with your actual passwords):
  ```properties
  CHALLENGEFIT_RELEASE_STORE_FILE=../../user.keystore
  CHALLENGEFIT_RELEASE_KEY_ALIAS=challengefit-alias
  CHALLENGEFIT_RELEASE_STORE_PASSWORD=your_keystore_password
  CHALLENGEFIT_RELEASE_KEY_PASSWORD=your_alias_password
  ```

- [ ] **4. Define Release Signing in build.gradle**
  Open `client/android/app/build.gradle`. Find the `signingConfigs` block and add the `release` configuration:
  ```gradle
  signingConfigs {
      debug {
          // ... existing debug config
      }
      release {
          if (project.hasProperty('CHALLENGEFIT_RELEASE_STORE_FILE')) {
              storeFile file(CHALLENGEFIT_RELEASE_STORE_FILE)
              storePassword CHALLENGEFIT_RELEASE_STORE_PASSWORD
              keyAlias CHALLENGEFIT_RELEASE_KEY_ALIAS
              keyPassword CHALLENGEFIT_RELEASE_KEY_PASSWORD
          }
      }
  }
  ```

- [ ] **5. Update Release Build Type**
  In the same `client/android/app/build.gradle` file, find the `buildTypes` block and update the `release` section to use the new signing configuration:
  ```gradle
  buildTypes {
      release {
          // ... other settings ...
          signingConfig signingConfigs.release // <-- Change this from signingConfigs.debug
      }
  }
  ```

- [ ] **6. Build and Verify**
  Run your local build script from the project root:
  ```bash
  ./build_android.sh
  ```
  The resulting `.aab` file will now be signed in **Release Mode** and ready for upload.
