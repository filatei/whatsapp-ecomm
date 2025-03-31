# rsync -avz --exclude=node_modules --exclude=.next --exclude=.env.local --exclude=build --include=.git -e "ssh -p 2525" ./ user2@fido.torama.ng:/var/www/whatsapp.torama.ng/

## update android/capacitor-cordova-android-plugins/build.gradle
 and change 
 sourceCompatibility JavaVersion.VERSION_21
targetCompatibility JavaVersion.VERSION_21
to 
sourceCompatibility JavaVersion.VERSION_17
targetCompatibility JavaVersion.VERSION_17
### cp app/build/outputs/apk/debug/app-debug.apk ~/Downloads