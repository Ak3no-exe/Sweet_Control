/* À coller dans index.html, à la FIN du dernier <script> (juste avant </script>).
   Ne fait rien dans un navigateur : ne s'active que dans l'APK. */
(async function initNativePush(){
  const Cap = window.Capacitor;
  if(!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  try{
    const { FirebaseMessaging } = Cap.Plugins;
    const perm = await FirebaseMessaging.requestPermissions();
    if(perm.receive !== 'granted') return;
    await FirebaseMessaging.subscribeToTopic({ topic: 'new-players' });
  }catch(e){ console.warn('Push non initialisé :', e); }
})();
