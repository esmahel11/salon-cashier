# 📱 دروستکردنی ئەپی مۆبایل - ڕێگای ئاسان

## چۆنیەتی دروستکردنی ئەپێکی ڕاستەقینە بۆ مۆبایل

---

## ڕێگای یەکەم: بەکارهێنانی Expo (پێشنیارکراو - زۆر ئاسانە) ⭐

### خاڵی ١: دامەزراندنی Expo CLI

```bash
npm install -g expo-cli eas-cli
```

### خاڵی ٢: دروستکردنی پرۆژەی نوێ

```bash
npx create-expo-app SalonCashier
cd SalonCashier
```

### خاڵی ٣: دامەزراندنی پێداویستیەکان

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install axios @react-native-async-storage/async-storage
npx expo install react-native-gesture-handler
```

### خاڵی ٤: دروستکردنی APK

```bash
# تۆمارکردن لە Expo (بەخۆڕایی)
eas login

# ڕێکخستنی Build
eas build:configure

# دروستکردنی APK بۆ ئەندرۆید
eas build -p android --profile preview
```

**تێبینی:** ئەم کارە لە سێرڤەری Expo ئەنجام دەدرێت و لە دوای ١٥-٣٠ خولەک، لینکی داگرتنی APK دەگاتە ئیمەیڵەکەت!

---

## ڕێگای دووەم: بەکارهێنانی React Native CLI (پێویستی بە Android Studio هەیە)

### پێداویستیەکان:
- Node.js
- Java JDK 11
- Android Studio
- Android SDK

### خاڵەکان:

١. دروستکردنی پرۆژە:
```bash
npx react-native init SalonCashier
```

٢. دامەزراندنی پێداویستیەکان (هەمان لە سەرەوە)

٣. دروستکردنی APK:
```bash
cd android
./gradlew assembleRelease
```

٤. فایلی APK لێرە دەبێت:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## ڕێگای سێیەم: گۆڕینی ئەپی ئێستات بۆ Capacitor (ئاسانترین!) 🎯

ئەمە باشترین ڕێگایە چونکە کۆدی React ی ئێستات بەکاردەهێنێت!

### خاڵی ١: دامەزراندنی Capacitor

لە فۆڵدەری `frontend`:

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init
```

کاتێک پرسیاری لێدەکات:
- **App name:** کاشێری سالۆن
- **App ID:** com.salon.cashier
- **Web directory:** build

### خاڵی ٢: Build کردنی React App

```bash
npm run build
```

### خاڵی ٣: زیادکردنی پلاتفۆرمی ئەندرۆید

```bash
npx cap add android
```

### خاڵی ٤: کۆپیکردنی فایلەکان

```bash
npx cap sync
```

### خاڵی ٥: کردنەوە لە Android Studio

```bash
npx cap open android
```

### خاڵی ٦: دروستکردنی APK

لە Android Studio:
- Build → Build Bundle(s) / APK(s) → Build APK(s)
- دوای چەند خولەک، APK ئامادە دەبێت
- کلیک لە "locate" بکە بۆ دۆزینەوەی فایلەکە

---

## ڕێگای چوارەم: بەکارهێنانی خزمەتگوزاریەکانی ئۆنلاین (بێ کۆد!) 🌐

### ١. AppGyver (بەخۆڕایی)
- بڕۆ بۆ: https://www.appgyver.com
- ئەپەکەت دروست بکە بە Drag & Drop
- APK دەرهێنە

### ٢. Thunkable (بەخۆڕایی)
- بڕۆ بۆ: https://thunkable.com
- ئەپەکەت دروست بکە
- APK دەرهێنە

### ٣. Kodular (بەخۆڕایی)
- بڕۆ بۆ: https://www.kodular.io
- ئەپەکەت دروست بکە
- APK دەرهێنە

---

## پێشنیاری من بۆ تۆ: 🎯

### بەکارهێنانی Capacitor (ڕێگای سێیەم)

**بۆچی؟**
✅ کۆدی React ی ئێستات بەکاردەهێنێت
✅ ناپێویستە لە سەرەتاوە دەست پێبکەیتەوە
✅ ئاسانە
✅ APK ی ڕاستەقینە دروست دەکات
✅ لەسەر مۆبایل وەک ئەپێکی ڕاستەقینە کار دەکات

**کێشەکەی:**
- پێویستە Android Studio دابمەزرێنیت (٣-٤ گیگابایت)
- یەکەم جار کەمێک کات دەخایەنێت

---

## ئەگەر نەتەوێت Android Studio دابمەزرێنیت:

### بەکارهێنانی Expo + EAS Build (ڕێگای یەکەم)

**بۆچی؟**
✅ هیچ پێویستی بە Android Studio نییە
✅ لە سێرڤەری Expo Build دەکرێت
✅ لینکی داگرتن دەگاتە ئیمەیڵەکەت
✅ بەخۆڕایی (تا ٣٠ Build لە مانگێک)

**کێشەکەی:**
- پێویستە کۆدەکە بگوێزیتەوە بۆ Expo
- کەمێک کات دەخایەنێت (١-٢ کاتژمێر بۆ گواستنەوە)

---

## ئایا دەتەوێت من کامیان بۆ جێبەجێ بکەم؟

١. **Capacitor** - کۆدی ئێستات بەکاردەهێنێت، بەڵام پێویستی بە Android Studio هەیە
٢. **Expo** - لە سەرەتاوە دەست پێدەکەینەوە، بەڵام بەبێ Android Studio
٣. **PWA** - ئەوەی ئێستا هەمانە (بەبێ داگرتن، لە وێبگەڕ کار دەکات)

**پێشنیاری من:** ئەگەر کۆمپیوتەرەکەت بەهێزە و بۆشاییت هەیە، **Capacitor** باشترینە.
ئەگەر نا، **PWA** ی ئێستات زۆر باشە و هیچ کارێکی زیاترت پێناکات!

بڵێ کامیان دەتەوێت؟
