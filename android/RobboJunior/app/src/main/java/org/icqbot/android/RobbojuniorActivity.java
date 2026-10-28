package org.icqbot.android;

import android.Manifest;
import android.animation.ObjectAnimator;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.bluetooth.BluetoothDevice;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.Base64;
import android.util.Log;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnSystemUiVisibilityChangeListener;
import android.view.ViewTreeObserver.OnGlobalLayoutListener;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.Toast;

//import com.google.android.gms.analytics.HitBuilders;
//import com.google.android.gms.analytics.Tracker;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Main activity for Scratch Jr., consisting of a full-screen landscape WebView.
 *
 * This activity creates an embedded WebView, which runs the HTML5 app containing the majority of the source code.
 *
 * Special thanks to Benesse Corp. for providing access to their Android port, which helped inspire some of the source code here.
 *
 * @author markroth8
 */
public class RobbojuniorActivity
    extends Activity
{
    /** Milliseconds to pan when showing the soft keyboard */
    private static final int SOFT_KEYBOARD_PAN_MS = 250;
    
    /** Log tag for Scratch Jr. app */
    private static final String LOG_TAG = "ScratchJr";
    
    /** Bundle key in which the current url is stored */
    private static final String BUNDLE_KEY_URL = "url";

    /** The url of the index page */
    private static final String INDEX_PAGE_URL = "file:///android_asset/HTML5/index.html";

    /** Container containing the web view */
    private RelativeLayout _container;

    /** Web browser containing the Scratch Jr. HTML5 webapp */
    private WebView _webView;

    /** Maintains connection to database */
    private DatabaseManager _databaseManager;

    /** Performs file IO */
    public IOManager _ioManager;

    /** Manages sounds */
    private SoundManager _soundManager;

    /** Manages recording of new sounds */
    private SoundRecorderManager _soundRecorderManager;

    /** Set to true when the app is initialized. This is used for unit testing. */
    private boolean _appInitialized = false;

    /** Set to true when the editor is initialized. This is used for unit testing. */
    private boolean _editorInitialized = false;

    /** Set to true when the splash screen is done loading. This is used for unit testing. */
    private boolean _splashDone = false;
    
    /** Y starting and ending coordinate for soft keyboard scroll position */
    private int _softKeyboardScrollPosY0;
    private int _softKeyboardScrollPosY1;

    /** Handler for posting delayed updates */
    private final Handler _handler = new Handler();

    /** Run-time Permissions */
    private final int SCRATCHJR_CAMERA_MIC_PERMISSION = 1;
    public int cameraPermissionResult = PackageManager.PERMISSION_DENIED;
    public int micPermissionResult = PackageManager.PERMISSION_DENIED;

    /** Analytics tracker */
    //private Tracker _tracker;

    String data[] = { "one", "two", "three", "four" };

    public  JavaScriptDirectInterface javaScriptDirectInterface;

    private LocalServer localServer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        _databaseManager = new DatabaseManager(this);
        _ioManager = new IOManager(this);
        _soundManager = new SoundManager(this);
        _soundRecorderManager = new SoundRecorderManager(this);
        setContentView(org.icqbot.android.R.layout.activity_scratch_jr);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        _container = (RelativeLayout) findViewById(org.icqbot.android.R.id.container);
        _webView = (WebView) findViewById(org.icqbot.android.R.id.webview);
        _webView.setBackgroundColor(0x00000000);
        _webView.clearCache(true);
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT) {
            Log.i(LOG_TAG, "Setting non-immersive full screen");
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        } else {
            setImmersiveMode();
        }
        configureWebView();
        registerSoftKeyboardPanner();
        /* URL to load once ready */
        String urlToLoad;
        if ((savedInstanceState != null) && savedInstanceState.containsKey(BUNDLE_KEY_URL)) {
            Log.i(LOG_TAG, "Restoring bundle state...");
            urlToLoad = savedInstanceState.getString(BUNDLE_KEY_URL);
            if (urlToLoad == null) {
                urlToLoad = INDEX_PAGE_URL;
            }
        } else {
            urlToLoad = INDEX_PAGE_URL;
        }
        _webView.loadUrl(urlToLoad);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.setAcceptFileSchemeCookies(true);

        String PROJECT_MIMETYPE = getApplicationContext().getString(org.icqbot.android.R.string.share_mimetype);
        Intent it = getIntent();
        if (it != null && it.getData() !=null) {
            receiveProject(it.getData());
        }

        RobbojuniorApplication application = (RobbojuniorApplication) getApplication();
        //_tracker = application.getDefaultTracker();

        // When System UI bar is displayed, wait one second and then re-assert immersive mode.
        getWindow().getDecorView().setOnSystemUiVisibilityChangeListener(new OnSystemUiVisibilityChangeListener() {
            @Override
            public void onSystemUiVisibilityChange(int visibility) {
                _handler.postDelayed(new Runnable() {
                    public void run() {
                        runOnUiThread(new Runnable() {
                            public void run() {
                                setImmersiveMode();
                            }
                        });
                    }
                }, 1000);
            }
        });

        //requestPermissions();//不再开始申请权限

        try {
            localServer = new LocalServer(this);
            localServer.start();
            android.util.Log.i("SERVER", "Local server started: http://localhost:8080");
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    //相机录音权限申请，scratchjr的写法，不符合安全需求，拆分为使用时调用
    public void requestPermissions() {
//        cameraPermissionResult = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA);
//        micPermissionResult = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO);
//
//        String[] desiredPermissions;
//        if (cameraPermissionResult != PackageManager.PERMISSION_GRANTED
//                && micPermissionResult != PackageManager.PERMISSION_GRANTED) {
//            desiredPermissions = new String[]{
//                    Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO
//            };
//        } else if (cameraPermissionResult != PackageManager.PERMISSION_GRANTED) {
//            desiredPermissions = new String[]{Manifest.permission.CAMERA};
//        } else if (micPermissionResult != PackageManager.PERMISSION_GRANTED) {
//            desiredPermissions = new String[]{Manifest.permission.RECORD_AUDIO};
//        } else {
//            return;
//        }
//
//        ActivityCompat.requestPermissions(this,
//                desiredPermissions,
//                SCRATCHJR_CAMERA_MIC_PERMISSION);
    }

    //检测录音权限
    public Boolean requestMicPermissions(String loc) {
        Map<String, String> texts = getLocalizedTexts(loc);
        micPermissionResult = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO);
        if (micPermissionResult != PackageManager.PERMISSION_GRANTED) {
            // 弹窗提示
            Toast.makeText(this, texts.get("mic_message"), Toast.LENGTH_SHORT).show();

            // 发起权限请求
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.RECORD_AUDIO},
                    SCRATCHJR_CAMERA_MIC_PERMISSION);
            return false;
        } else {
            // 已有权限，执行录音逻辑
            String a = "UI.show_recordSound();\n";
            runJavaScript(a);
            return true;
        }
    }
    //检测相机权限
    public Boolean requestCameraPermissions(String loc) {
        Map<String, String> texts = getLocalizedTexts(loc);
        cameraPermissionResult = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA);
        if (cameraPermissionResult != PackageManager.PERMISSION_GRANTED) {
            // 弹窗提示
            Toast.makeText(this, texts.get("camera_message"), Toast.LENGTH_SHORT).show();

            // 发起权限请求
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.CAMERA},
                    SCRATCHJR_CAMERA_MIC_PERMISSION);
            return false;
        } else {
            // 已有权限，执行录音逻辑
            String a = "UI.show_setMode();\n";
            runJavaScript(a);
            return true;
        }
    }

    //检测相机权限
    public Boolean requestCameraPermissions_ai(String loc) {
        Map<String, String> texts = getLocalizedTexts(loc);
        cameraPermissionResult = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA);
        if (cameraPermissionResult != PackageManager.PERMISSION_GRANTED) {
            return false;
        } else {
            return true;
        }
    }
    // 多语言文本配置
    private Map<String, String> getLocalizedTexts(String loc) {
        Map<String, String> texts = new HashMap<>();
        switch (loc) {
            case "en":
                texts.put("mic_message", "Microphone permission is missing. Functionality is limited. Please enable it in Settings.");
                texts.put("camera_message", "Camera permission is missing. Functionality is limited. Please enable it in Settings.");
                break;
            case "ru":
                texts.put("mic_message", "Отсутствует разрешение на микрофон. Функциональность ограничена. Включите его в Настройках.");
                texts.put("camera_message", "Отсутствует разрешение на камеру. Функциональность ограничена. Включите его в Настройках.");
                break;
            default: // 默认中文
                texts.put("mic_message", "缺少录音权限，功能受限。请前往设置启用。");
                texts.put("camera_message", "缺少相机权限，功能受限。请前往设置启用。");
        }
        return texts;
    }


    protected Dialog onCreateDialog(){
        AlertDialog.Builder adb = new AlertDialog.Builder(this);

        adb.setTitle("Android  dialog test");
        ArrayAdapter<String> adapter = new ArrayAdapter<String>(this,
                android.R.layout.select_dialog_singlechoice, data);
        adb.setSingleChoiceItems(adapter, -1, robot_choose_click);

        return adb.create();
    }

    DialogInterface.OnClickListener robot_choose_click = new DialogInterface.OnClickListener() {
        public void onClick(DialogInterface dialog, int which) {
            ListView lv = ((AlertDialog) dialog).getListView();
            if (which == Dialog.BUTTON_POSITIVE)
                // выводим в лог позицию выбранного элемента
                Log.d(LOG_TAG, "pos = " + lv.getCheckedItemPosition());
            else
                // выводим в лог позицию нажатого элемента
                Log.d(LOG_TAG, "which = " + which);
        }
    };

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           String permissions[], int[] grantResults) {
        if (requestCode == SCRATCHJR_CAMERA_MIC_PERMISSION) {
            int permissionId = 0;
            for (String permission : permissions) {
                if (permission.equals(Manifest.permission.CAMERA)) {
                    cameraPermissionResult = grantResults[permissionId];
                }
                if (permission.equals(Manifest.permission.RECORD_AUDIO)) {
                    micPermissionResult = grantResults[permissionId];
                }
                permissionId++;
            }
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT && hasFocus) {
            setImmersiveMode();
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, @NonNull KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            switch (keyCode) {
                case KeyEvent.KEYCODE_BACK:
                    // Check the WebView to see if we're on the editor page.
                    // If so, call the JavaScript to save the current project
                    // and return to the lobby.

                    if (javaScriptDirectInterface.bd.isSeraching) {

                        javaScriptDirectInterface.bd.StopSearching();


                    }else{

                        final String url = _webView.getUrl();
                        if (url != null) {
                            Log.i("LOG_TAG", url);
                            if (url.contains("home.html")) {
                                runJavaScript("Lobby.goHome()");
                            } else if (url.contains("gettingstarted.html")) {
                                runJavaScript("closeme()");
                            } else if (url.contains("index.html")) {
                                finish();
                            } else if (url.contains("editor.html")) {
                                runJavaScript("ScratchJr.goBack()");
                            } else if (_webView.canGoBack()) {
                                _webView.goBack();
                            }
                        }
                        return true;
                    }
            }
        }
        return super.onKeyDown(keyCode, event);
    }



    @Override
    protected void onResume() {
        super.onResume();
        _databaseManager.open();
        _soundManager.open();
        _soundRecorderManager.open();
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                _webView.onResume();
                CookieSyncManager.getInstance().startSync();
            }
        });
        runJavaScript("if (typeof(ScratchJr) !== 'undefined') ScratchJr.onResume();");
    }

    @Override
    protected void onPause() {
        super.onPause();
        runJavaScript("if (typeof(ScratchJr) !== 'undefined') ScratchJr.onPause();");
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                _webView.onPause();
                CookieSyncManager.getInstance().stopSync();
            }
        });
        _databaseManager.close();
        _soundManager.close();
        _soundRecorderManager.close();
    }
    
    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putString(BUNDLE_KEY_URL, _webView.getUrl());
    }

    @Override
    protected void onNewIntent(Intent it) {
        super.onNewIntent(it);
        //String PROJECT_MIMETYPE = getApplicationContext().getString(org.robbojunior.android.R.string.share_mimetype);
        if (it != null && it.getData() != null ) {
            receiveProject(it.getData());
        }
    }

    private void receiveProject(Uri projectUri) {
        // Read the project one byte at a time into a buffer
        ByteArrayOutputStream projectData = new ByteArrayOutputStream();
        try {
            InputStream is = getContentResolver().openInputStream(projectUri);
            byte[] readByte = new byte[1];
            while ((is.read(readByte)) == 1) {
                projectData.write(readByte[0]);
            }
        } catch (FileNotFoundException e) {
            Log.i(LOG_TAG, "File not found in project load");
            return;
        } catch (IOException e) {
            Log.i(LOG_TAG, "IOException in project load");
            return;
        }
        // We send the project Base64-encoded to JavaScript where it's processed and unpacked
        String base64Project = Base64.encodeToString(projectData.toByteArray(), Base64.DEFAULT);
        runJavaScript("iOS.loadProjectFromSjr('" + base64Project + "');");
    }

    public RelativeLayout getContainer() {
        return _container;
    }

    public DatabaseManager getDatabaseManager() {
        return _databaseManager;
    }

    public IOManager getIOManager() {
        return _ioManager;
    }

    public SoundManager getSoundManager() {
        return _soundManager;
    }

    public SoundRecorderManager getSoundRecorderManager() {
        return _soundRecorderManager;
    }

    private void setImmersiveMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            Log.i(LOG_TAG, "Setting immersive mode");
            int immersiveStickyFlag = 0;
            try {
                immersiveStickyFlag = View.class.getField("SYSTEM_UI_FLAG_IMMERSIVE_STICKY").getInt(null);
            } catch (IllegalAccessException | IllegalArgumentException | NoSuchFieldException e) {
                Log.e(LOG_TAG, "Reflection fail", e);
            }
            _webView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                  | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                  | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                  | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                  | View.SYSTEM_UI_FLAG_FULLSCREEN
                  | immersiveStickyFlag);
        }
    }

    @SuppressLint({"JavaScriptInterface","SetJavaScriptEnabled"})
    private void configureWebView() {
        WebSettings webSettings = _webView.getSettings();
        webSettings.setJavaScriptEnabled(true);//支持js

        webSettings.setDefaultTextEncodingName("utf-8");

        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setLoadWithOverviewMode(false);
        webSettings.setUseWideViewPort(true);
        _webView.setVerticalScrollBarEnabled(true);
        _webView.setHorizontalScrollBarEnabled(true);
        // Uncomment to enable remote Chrome debugging on a physical Android device
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        // Enable cookie persistence
        CookieManager.setAcceptFileSchemeCookies(true);
        CookieManager cookieManager = CookieManager.getInstance();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(_webView, true);
        } else {
            cookieManager.setAcceptCookie(true);
        }
        CookieSyncManager.createInstance(this);

        /* Object exposed to the JavaScript that makes it easy to bridge JavaScript and Java */
        javaScriptDirectInterface = new JavaScriptDirectInterface(this, (RobbojuniorApplication) getApplication());
        _webView.addJavascriptInterface(javaScriptDirectInterface, "AndroidInterface");
        _webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(LOG_TAG, description);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Filter out Internet links and open those with the Android browser
                if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                    view.getContext().startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                    return true;
                }
                return false; // Allow WebView to load url
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                // Sync cookies
                CookieSyncManager.getInstance().sync();

                // Track page load
                String[] parts = url.split("/");
                //_tracker.setScreenName(parts[parts.length - 1]);
                //_tracker.send(new HitBuilders.ScreenViewBuilder().build());
            }
        });
        _webView.requestFocus(View.FOCUS_DOWN);
        webSettings.setAllowFileAccess(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            webSettings.setAllowFileAccessFromFileURLs(true);
            webSettings.setAllowUniversalAccessFromFileURLs(true);
        }

        webSettings.setAllowContentAccess(true);

        // Configure the web chrome client to consume console.log
        // calls from JavaScript.
        Log.i(LOG_TAG, "Configurating webChromeClient");
        _webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(@NonNull ConsoleMessage cm) {
               // Log.e(LOG_TAG, "JavaScript log, " + cm.sourceId() + ":" + cm.lineNumber() + ", " + cm.message());
                return true;
            }
        });
    }

    public void createNewProject() {
        runJavaScript("Home.createNewProject()");
    }

    /**
     * Returns true when all resources are loaded and the app is initialized.
     */
    public boolean isAppInitialized() {
        return _appInitialized;
    }

    public void setAppInitialized(boolean initialized) {
        _appInitialized = initialized;
    }

    public boolean isEditorInitialized() {
        return _editorInitialized;
    }

    public void setEditorInitialized(boolean initialized) {
        _editorInitialized = initialized;
    }

    public boolean isSplashDone() {
        return _splashDone;
    }

    public void setSplashDone(boolean done) {
        _splashDone = done;
    }

    /**
     * Click the "Home" button on the title screen (for unit testing).
     */
    public void goHome() {
        Log.e(LOG_TAG, "-------------------------------------------------------");
        runJavaScript("gohome()");
    }
    public void go2(String a) {
        Log.i("TAG", a);
        runJavaScript("alert(1)");
    }
    /**
     * Run the given JavaScript in the web view.
     * 在web视图中运行给定的JavaScript。
     */
    public void runJavaScript(final String js) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                _webView.loadUrl("javascript:" + js);
            }
        });
    }

    public void translateAndScaleRectToContainerCoords(RectF rect, float devicePixelRatio) {
        float wx = _webView.getX();
        float wy = _webView.getY();
        rect.set(wx + rect.left * devicePixelRatio, wy + rect.top * devicePixelRatio,
            wx + rect.right * devicePixelRatio, wy + rect.bottom * devicePixelRatio);
    }

    public void setSoftKeyboardScrollLocation(int topYPx, int bottomYPx) {
        _softKeyboardScrollPosY0 = topYPx;
        _softKeyboardScrollPosY1 = bottomYPx;
    }
    
    /**
     * Height of the status bar at the top of the screen
     * 屏幕顶部状态栏的高度
     */
    private int getStatusBarHeight() {
        Rect rectangle= new Rect();
        Window window= getWindow();
        window.getDecorView().getWindowVisibleDisplayFrame(rectangle);
        int result = rectangle.top;
        return result;
    }

    /**
     * Android does not properly pan to the text fields in full screen mode, so
     * here we introduce some custom logic to pan when the soft keyboard appears.
     *
     * The technique used here was inspired by http://stackoverflow.com/questions/7417123/
     * android-how-to-adjust-layout-in-full-screen-mode-when-softkeyboard-is-visible
     */
    private void registerSoftKeyboardPanner() {
        _container.getViewTreeObserver().addOnGlobalLayoutListener(
            new OnGlobalLayoutListener() {
                private int _priorVisibleHeight;
                private ObjectAnimator _currentAnimator;

                @Override
                public void onGlobalLayout() {
                    Rect r = new Rect();
                    _container.getWindowVisibleDisplayFrame(r);
                    int currentVisibleHeight = r.bottom - r.top;

                    // Determine if visible height changed
                    if (currentVisibleHeight != _priorVisibleHeight) {
                        // Determine if keyboard visibility changed
                        int screenHeight = _container.getRootView().getHeight();
                        int coveredHeight = screenHeight - currentVisibleHeight;
                        if((currentVisibleHeight < _priorVisibleHeight) && (coveredHeight > (screenHeight / 4))) {
                            // Keyboard probably just became visible

                            // Get the current focus elements top & bottom using a ratio to convert the values
                            // to the native scale.
                            int elTop = _softKeyboardScrollPosY0;
                            int elBottom = _softKeyboardScrollPosY1;

                            // Determine the amount of the focus element covered by the keyboard
                            int elPixelsCovered = elBottom - currentVisibleHeight;

                            // If any amount is covered
                            if (elPixelsCovered > 0) {
                                // Pan by the amount of coverage
                                int panUpPixels = elPixelsCovered;

                                // Prevent panning so much the top of the element becomes hidden
                                panUpPixels = panUpPixels > elTop ? elTop : panUpPixels;

                                // Prevent panning more than the keyboard height (which produces an empty gap in the screen)
                                int statusBarHeight = getStatusBarHeight();
                                panUpPixels = panUpPixels > (coveredHeight - statusBarHeight) ?
                                    (coveredHeight - statusBarHeight) : panUpPixels;

                                // Pan up
                                cancelAnimator();
                                ObjectAnimator animator = ObjectAnimator.ofFloat(_container, "y", _container.getY(), -panUpPixels).
                                    setDuration(SOFT_KEYBOARD_PAN_MS);
                                animator.start();
                                _currentAnimator = animator;
                            }
                            else {
                                cancelAnimator();
                                ObjectAnimator animator = ObjectAnimator.ofFloat(_container, "y", _container.getY(),
                                    getStatusBarHeight()).setDuration(SOFT_KEYBOARD_PAN_MS);
                                animator.start();
                                _currentAnimator = animator;
                            }
                        } else if (currentVisibleHeight > _priorVisibleHeight) {
                            // Keyboard probably just became hidden

                            // Reset pan
                            cancelAnimator();
                            ObjectAnimator animator = ObjectAnimator.ofFloat(_container, "y", _container.getY(), 0).
                                setDuration(SOFT_KEYBOARD_PAN_MS);
                            animator.start();
                            _currentAnimator = animator;
                            setImmersiveMode();
                            runJavaScript("if (typeof(ScratchJr) !== 'undefined') ScratchJr.editDone();");
                        }

                        // Save usable height for the next comparison
                        _priorVisibleHeight = currentVisibleHeight;
                    }
                }

                private void cancelAnimator() {
                    ObjectAnimator animator = _currentAnimator;
                    if (animator != null) {
                        if (animator.isStarted()) {
                            animator.cancel();
                        }
                        _currentAnimator = null;
                    }
                }
            });
    }


    public void scan() {//扫描成功
        String a="aaa=[";
        String[] arrNames = new String[JavaScriptDirectInterface.bleScanFilters.size()];
        int index = 0;
        for (BluetoothDevice device : JavaScriptDirectInterface.bleScanFilters) {
            a += "\""+device.getName()+"*"+device.getAddress()+"\"";

            if(JavaScriptDirectInterface.bleScanFilters.size()-1>index){
                a+=",";
            }
            index++;
        }
       a+="];";
        Log.i("TAG", a);
        runJavaScript(a);
    }

    String oldVoiceData1 = "00";
    String oldVoiceData2 = "00";
    //发送数据至js
    public void set_data(String data) {
        String a="";

        if(data.substring(0,2).equals("56")){//版本信息
            a="UI.showVersion('"+String.valueOf(Integer.parseInt(data.substring(2,4))-30)+"."+String.valueOf(Integer.parseInt(data.substring(6,8))-30)+"');\n";
            runJavaScript(a);
            return;
        }

        //Log.i("TAG", data); //0B 01 0C 0000010100
        //数据处理 0B 0202 0000 00 00 0F
         if(data.substring(2,4).equals("02"))   {//倾斜传感器
             a+="tilt_data=[\"1\",\""+ data.substring(4,6)+"\"];\n console.log(tilt_data);\n";
             a+="port1=\"02\";\n console.log(port1);\n";
         }else if(data.substring(2,4).equals("01")){//光电传感器
             String b= String.valueOf(Integer.parseInt(data.substring(4,6),16));
             a+="light_data1=[\"1\","+ b +"];\n console.log(light_data1);\n";
             a+="port1=\"01\";\n console.log(port1);\n";
         }else if(data.substring(2,4).equals("04")){//语音
             String b = data.substring(4,6);//08
             if(Vtype){
                 b="00";
             }
             /*if (!b.equals("00")){
                if(oldVoiceData1.equals("00")){
                    oldVoiceData1 = b;
                    Timer timer = new Timer();
                    timer.schedule(new TimerTask() {
                        @Override
                        public void run() {
                            oldVoiceData1="00";
                        }
                    }, 400);
                }else{
                    b="00";
                }
             }else {
                 oldVoiceData1=b;
             }*/
             a+="voice_data=[\"1\",\""+ b+"\"];\n console.log(voice_data);\n";
             a+="port1=\"04\";\n console.log(port1);\n";
         }else if(data.substring(2,4).equals("00")){//null
             a+="port1=\"\";\n console.log(port1);\n";
             a+="light_data1=[\"\",\"\"];\n console.log(light_data1);\n";
             a+="voice_data=[\"\",\"\"];\n console.log(voice_data);\n";
             a+="tilt_data=[\"\",\"\"];\n console.log(tilt_data);\n";
         }


        if(data.substring(6,8).equals("02"))   {//倾斜传感器
            a+="tilt_data=[\"2\",\""+ data.substring(8,10)+"\"];\n console.log(tilt_data);\n";
            a+="port2=\"02\";\n console.log(port2);\n";
        }else if(data.substring(6,8).equals("01")){//光电传感器
            String b= String.valueOf(Integer.parseInt(data.substring(8,10),16));
            a+="light_data2=[\"2\","+  b  +"];\n console.log(light_data2);\n";
            a+="port2=\"01\";\n console.log(port2);\n";
        }else if(data.substring(6,8).equals("04")){//语音
            String b = data.substring(8,10);//08
            if(Vtype){
                b="00";
            }
            /*if (!b.equals("00")){
                if(oldVoiceData2.equals("00")){
                    oldVoiceData2 = b;
                    Timer timer = new Timer();
                    timer.schedule(new TimerTask() {
                        @Override
                        public void run() {
                            oldVoiceData2="00";
                        }
                    }, 400);
                }else{
                    b="00";
                }
            }else {
                oldVoiceData2=b;
            }*/
            a+="voice_data=[\"2\",\""+ b+"\"];\n console.log(voice_data);\n";
            a+="port2=\"04\";\n console.log(port2);\n";
        }else if(data.substring(6,8).equals("00")){//null
           // Log.d("---传感器---: ", "null2");
            a+="port2=\"\";\n console.log(port2);\n";
            a+="light_data2=[\"\",\"\"];\n console.log(light_data2);\n";

            if(!data.substring(2,4).equals("04")){
                a+="voice_data=[\"\",\"\"];\n console.log(voice_data);\n";
            }
            if(!data.substring(2,4).equals("02")){
                a+="tilt_data=[\"\",\"\"];\n console.log(tilt_data);\n";
            }

        }

        //
        a+="button_data1=[\"1\",\""+ data.substring(10,12)+"\"];\n console.log(button_data1);\n";
        a+="button_data2=[\"2\",\""+ data.substring(12,14)+"\"];\n console.log(button_data2);\n";

     //   Log.i("TAG", a);  //
        runJavaScript(a);
    }


    public void conn(String name) {//连接成功
        String a="connName=\'"+name+"\';\n console.log(connName);\nUI.connSu();\n";
        runJavaScript(a);
    }
    public void disconn() {//连接断开
        String a="connName=\'\';\n UI.BTclose();\n";
        runJavaScript(a);
    }
    public void sensorInit() {//传感器数值初始化
        String a="";

        a+="port1=\"\";\n console.log(port1);\n";
        a+="light_data1=[\"\",\"\"];\n console.log(light_data1);\n";
        a+="port2=\"\";\n console.log(port2);\n";
        a+="light_data2=[\"\",\"\"];\n console.log(light_data2);\n";
        a+="voice_data=[\"\",\"\"];\n console.log(voice_data);\n";
        a+="tilt_data=[\"\",\"\"];\n console.log(tilt_data);\n";
        a+="button_data1=[\"1\",\"00\"];\n console.log(button_data1);\n";
        a+="button_data2=[\"2\",\"00\"];\n console.log(button_data2);\n";
        a+="console.log(\"11111111111111\");\n";

        runJavaScript(a);
    }

    public void set_scing(String data) {//是否正在刷新蓝牙列表
        String a="scing="+data+";\n console.log(scing);\n";
        runJavaScript(a);
    }

    public void rssi_type() {//
        String a="rssi_type=\"t\";\n console.log(rssi_type);\n";
        runJavaScript(a);
    }


    public void closeAIWindow() {
        if (!aiWindowOpen || aiWindow == null) {
            return;
        }
        FrameLayout root = (FrameLayout) findViewById(android.R.id.content);

        //通知 JS 停止
        if (currentModuleType != null) {
            String js = currentModuleType + "_data = [0,0,0,0,0,0];";
            runJavaScript(js);
        }

        // 移除窗口
        root.removeView(aiWindow);

        //释放 WebView（
        if (aiWebView != null) {
            aiWebView.stopLoading();
            aiWebView.loadUrl("about:blank");
            aiWebView.clearHistory();
            aiWebView.removeAllViews();
            aiWebView.destroy();
            aiWebView = null;
        }

        aiWindow = null;
        aiContainer = null;
        currentModuleType = null;

        aiWindowOpen = false;

        Log.i("AI_WINDOW", "AI 窗口已关闭");
    }

    private Boolean aiWindowOpen = false;//记录当前已打开窗口
    // ✅ 窗口相关成员变量
    private LinearLayout aiWindow;//外层窗口
    private FrameLayout aiContainer;
    private WebView aiWebView;

    // 当前 moduleType（可选，用于关闭时通知 JS）
    private String currentModuleType;

    public void showAIWindow(final String moduleType) {
        // 如果已经打开，直接返回
        if (aiWindowOpen) {
            Log.w("AI_WINDOW", moduleType + " 窗口已打开，忽略重复请求");
            return;
        }
        aiWindowOpen = true; // 注册
        this.currentModuleType = moduleType;

        final FrameLayout root = (FrameLayout) findViewById(android.R.id.content);

        // 外层窗口
        aiWindow = new LinearLayout(this);
        aiWindow.setOrientation(LinearLayout.VERTICAL);

        // 圆角背景
        GradientDrawable bg = new GradientDrawable();
        bg.setColor( 0x0A84FF);
        bg.setCornerRadius(30);
        aiWindow.setBackground(bg);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            aiWindow.setClipToOutline(true);
        }
        aiWindow.setPadding(2, 2, 2, 2);

        // 内容容器
        aiContainer = new FrameLayout(this);

        // WebView（摄像头画面）
        aiWebView = new WebView(this);
        WebSettings settings = aiWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setMediaPlaybackRequiresUserGesture(false);
        aiWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // 摄像头权限
        aiWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                if (Build.VERSION.SDK_INT >= 21) {
                    RobbojuniorActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Log.i("AI_DEBUG", "摄像头权限请求");
                            // ⭐ 授权摄像头
                            request.grant(request.getResources());
                        }
                    });
                }
            }
        });

        aiWebView.loadUrl("http://localhost:8080/HTML5/ai/"+moduleType+".html");

        // WebView铺满
        aiContainer.addView(aiWebView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));

        // 右上角按钮
        LinearLayout btnGroup = new LinearLayout(this);
        // 放大按钮
        final Button btnResize = createFloatButton("⛶");
        // 关闭按钮
        final Button btnClose = createFloatButton("✕");
        // 模糊切换按钮
        final Button btnBlurToggle = createFloatButton("◎");

        btnGroup.addView(btnBlurToggle);
        btnGroup.addView(btnResize);
        btnGroup.addView(btnClose);

        FrameLayout.LayoutParams btnParams =new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT);

        btnParams.gravity = Gravity.TOP | Gravity.END;
        btnParams.setMargins(0, 20, 20, 0);

        // ⭐ 加入 window
        aiWindow.addView(aiContainer, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
        ));

        // ==========================
        // 初始大小
        // ==========================
        final FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(320, 240);
        params.topMargin = 100;
        params.leftMargin = root.getWidth() - 640 - 50;

        root.addView(aiWindow, params);

        // ==========================
        // 关闭按钮
        // ==========================
        btnClose.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
//                root.removeView(aiWindow);
//                aiWindowOpen = false;
                closeAIWindow();
            }
        });

        // ==========================
        // ⭐ 放大 / 缩小
        // ==========================
        btnResize.setOnClickListener(new View.OnClickListener() {
            boolean big = false;

            @Override
            public void onClick(View v) {
                if (big) {
                    // ⭐ 变小
                    params.width = 320;
                    params.height = 240;

                    btnResize.setText("⛶"); // 显示“放大”
                } else {
                    // ⭐ 变大
                    params.width = 640;
                    params.height = 480;

                    btnResize.setText("▢"); // 显示“缩小”
                }

                aiWindow.setLayoutParams(params);
                big = !big;
            }
        });

        // ==========================
        // ⭐ 模糊 / 清晰切换
        // ==========================
        btnBlurToggle.setOnClickListener(new View.OnClickListener() {
            boolean uiVisible = true;

            @Override
            public void onClick(View v) {
                uiVisible = !uiVisible;

                if (uiVisible) {
                    // 开启模糊 + 描边
                    btnBlurToggle.setText("◎");
                } else {
                    // 关闭模糊 + 描边
                    btnBlurToggle.setText("◉");
                }

                // 调用 JS 统一控制
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    aiWebView.evaluateJavascript(
                            "setUIVisible(" + uiVisible + ")",
                            null
                    );
                }
            }
        });

        // ==========================
        // ⭐ 整个窗口可拖动
        // ⭐ 拖动层（透明）
        // ==========================
        android.view.View dragView = new android.view.View(this);
        dragView.setBackgroundColor(0x00000000); // 透明

        android.widget.FrameLayout.LayoutParams dragParams =
                new android.widget.FrameLayout.LayoutParams(
                        android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                        android.widget.FrameLayout.LayoutParams.MATCH_PARENT
                );

        aiContainer.addView(dragView, dragParams);
        dragView.setOnTouchListener(new android.view.View.OnTouchListener() {
            float lastX, lastY;

            @Override
            public boolean onTouch(android.view.View v, android.view.MotionEvent event) {
                switch (event.getAction()) {
                    case android.view.MotionEvent.ACTION_DOWN:
                        lastX = event.getRawX();
                        lastY = event.getRawY();
                        return true;
                    case android.view.MotionEvent.ACTION_MOVE:
                        float dx = event.getRawX() - lastX;
                        float dy = event.getRawY() - lastY;

                        params.leftMargin += (int) dx;
                        params.topMargin += (int) dy;

                        //防止托出屏幕
                        params.leftMargin = Math.max(0, params.leftMargin);
                        params.topMargin = Math.max(0, params.topMargin);

                        params.leftMargin = Math.min(params.leftMargin, root.getWidth() - aiWindow.getWidth());
                        params.topMargin = Math.min(params.topMargin, root.getHeight() - aiWindow.getHeight());

                        aiWindow.setLayoutParams(params);

                        lastX = event.getRawX();
                        lastY = event.getRawY();
                        break;
                }
                return true;
            }
        });

        aiContainer.addView(btnGroup, btnParams);//zui hou jia ru an niu

        aiWebView.addJavascriptInterface(new Object() {
            @android.webkit.JavascriptInterface
            public void onFaceData(String data) {
                //Log.i("AI_DATA", "收到数据: " + data);
                String a=moduleType+"_data = " + data + ";";
                runJavaScript(a);
            }
        }, "Android");
    }

    private android.widget.Button createFloatButton(String text) {
        android.widget.Button btn = new android.widget.Button(this);

        // 文字
        btn.setText(text);
        btn.setTextColor(0xFFFFFFFF);
        btn.setTextSize(14);
        btn.setAllCaps(false); // 防止自动大写导致尺寸变化

        // ✅ 固定尺寸（dp）
        int size = dp2px(25);
        btn.setWidth(size);
        btn.setHeight(size);

        // ✅ 禁止最小宽高（关键）
        btn.setMinWidth(0);
        btn.setMinimumWidth(0);
        btn.setMinHeight(0);
        btn.setMinimumHeight(0);

        // ✅ 去掉内边距
        btn.setPadding(0, 0, 0, 0);

        // ✅ 圆角背景
        android.graphics.drawable.GradientDrawable bg =
                new android.graphics.drawable.GradientDrawable();
        bg.setColor(0x66000000);
        bg.setCornerRadius(100); // 正圆
        btn.setBackground(bg);

        // ✅ 禁止点击阴影（Android 5.0+）
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            btn.setStateListAnimator(null);
        }

        // ✅ 按钮间距（不用 WRAP_CONTENT）
        android.widget.LinearLayout.LayoutParams lp =
                new android.widget.LinearLayout.LayoutParams(size, size);
        lp.setMargins(dp2px(6), 0, 0, 0);
        btn.setLayoutParams(lp);

        return btn;
    }

    private int dp2px(int dp) {
        return (int) android.util.TypedValue.applyDimension(
                android.util.TypedValue.COMPLEX_UNIT_DIP,
                dp,
                getResources().getDisplayMetrics()
        );
    }


    private Handler timeoutHandler = new Handler();
    private Runnable task = new Runnable() {
        @Override
        public void run() {
            Vtype=false;
        }
    };
    boolean Vtype=false;
    public void steVtype() {
        Vtype=true;
        timeoutHandler.removeCallbacks(task);
        timeoutHandler.postDelayed(task,800);
    }



}
