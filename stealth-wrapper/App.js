import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, BackHandler, Platform, ActivityIndicator, Text, PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const webViewRef = useRef(null);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [isSystemReady, setIsSystemReady] = useState(false);

  const WEB_APP_URL = "https://beta-global-studies-archive.netlify.app/";

  useEffect(() => {
    const backAction = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    async function bootSystem() {
      try {
        if (Platform.OS === 'android') {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ...(Platform.Version >= 33 ? [PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS] : [])
          ]);
        }

        const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';
        if (isExpoGo) {
          setExpoPushToken("DUMMY_TOKEN_FOR_EXPO_GO");
        } else {
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
            }),
          });

          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'default',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF231F7C',
            });
          }

          if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
              const { status } = await Notifications.requestPermissionsAsync();
              finalStatus = status;
            }
            if (finalStatus === 'granted') {
              // 👇 Yahan maine tera exact naya ID daal diya hai
              const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId || "5d96d1da-897e-4961-97e0-f98a660bd26a", 
              });
              setExpoPushToken(tokenData.data);
            } else {
              setExpoPushToken("DUMMY_TOKEN_FAIL");
            }
          } else {
            setExpoPushToken("DUMMY_TOKEN_SIMULATOR");
          }
        }
      } catch (error) {
        console.warn("Boot warning bypassed safely:", error);
        setExpoPushToken("DUMMY_TOKEN_ERROR");
      } finally {
        setIsSystemReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    bootSystem();
  }, []);

  if (!isSystemReady || !expoPushToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Initializing secure modules...</Text>
      </View>
    );
  }

  // Inject token securely
  const INJECTED_JAVASCRIPT = `
    window.EXPO_PUSH_TOKEN = "${expoPushToken}";
    try {
      window.localStorage.setItem("EXPO_PUSH_TOKEN", "${expoPushToken}");
    } catch(e) {}
    window.postMessage(JSON.stringify({ type: 'EXPO_PUSH_TOKEN', token: "${expoPushToken}" }), '*');
    true; 
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        allowsBackForwardNavigationGestures
        bounces={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onPermissionRequest={(request) => {
          request.grant();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#18181b' }, 
  loadingContainer: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#475569', marginTop: 16, fontFamily: 'sans-serif', fontSize: 14, fontWeight: '500' },
  webview: { flex: 1, marginTop: Constants.statusBarHeight, backgroundColor: '#18181b' },
});