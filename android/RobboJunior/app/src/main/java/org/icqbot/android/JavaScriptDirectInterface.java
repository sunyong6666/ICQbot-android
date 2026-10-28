package org.icqbot.android;

import static android.support.v4.content.ContextCompat.startActivity;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.Manifest;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.RectF;
import android.hardware.Camera;
import android.net.Uri;
import android.os.Handler;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.text.Html;
import android.util.Base64;
import android.util.Log;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;
import android.widget.ImageView;
import android.widget.RelativeLayout;



/**
 * The methods in this inner class are exposed directly to JavaScript in the HTML5 pages
 * as AndroidInterface.
 *
 * @author sunyong
 */
public class JavaScriptDirectInterface {
    private static final String LOG_TAG = "Robbojunior.JSDirect";
    /** Activity hosting the webview running the JavaScript 托管运行JavaScript的webview的活动*/
    private final RobbojuniorActivity _activity;
    private final RobbojuniorApplication _application;

    /** Current camera view, if active */
    private CameraView _cameraView;

    /** Current camera mask, if active */
    private ImageView _cameraMask;

    private final BluetoothThings bt = new BluetoothThings();
    public final BluetoothDevices bd;

    public final SjrFileSelectedListner fsl;

    public static BlueBle bb ;
    //BleScanCallback scanCallback;
    public static List<BluetoothDevice> bleScanFilters = new ArrayList<>();

    int type1= 1;
    int power1= 0;
    int type2= 1;
    int power2= 0;
    int led=0;

    List<Integer> motor_speed= Arrays.asList(0,159,171,183,195,207,219,231,243,255);

    /**
     * @param scratchJrActivity
     */
    JavaScriptDirectInterface(RobbojuniorActivity scratchJrActivity, RobbojuniorApplication application) {
        _activity = scratchJrActivity;
        _application = application;

         bd = new BluetoothDevices(_activity,bt);

        fsl = new SjrFileSelectedListner(_activity);

        bb = new BlueBle(_activity);
        /*if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            scanCallback=new BleScanCallback();
        }*/
    }

    @JavascriptInterface
    public void log(String message) {
        Log.i(LOG_TAG, message);
    }

    @JavascriptInterface
    public int setMotorPower(int leftSpeed, int rightSpeed) {

       RobotPowerFunction rp = new RobotPowerFunction(bt);

        rp.setRobotPower(leftSpeed,rightSpeed);

      return 0;
    }

    @JavascriptInterface
    public void  startDeviceSearch(String ble_zd,String loc){//开始设备搜索
        bb.scanBlueTooth(ble_zd,loc);
    }
    @JavascriptInterface
    public void  stopDeviceSearch(){//停止设备搜索
        bb.stopscanBlueTooth();
    }

    @JavascriptInterface
    public void  connectBluetooth(String id,String name){//连接蓝牙
        bb.connectBluetooth(id,name);
    }

    @JavascriptInterface
    public void  disconnect() {//断开连接蓝牙
            bb.disconnect();
    }
    @JavascriptInterface
    public void  disconnect_type() {//清除蓝牙状态
        bb.disconnect_type();
    }

    @JavascriptInterface
    public void  getBLEstate() {//获取当前连接蓝牙名称
        bb.getBLEstate();
    }



    @JavascriptInterface
    public void  setBleZD(String zd) {//设置自动连接
        bb.setBleZD(zd);
    }

    @JavascriptInterface
    public void  upname(String name) {//蓝牙改名
        name="@"+name;
        byte[] z = name.getBytes();
        for(int i=z.length;i<19;i++){
            name=name+" ";
        }
        name=name+"@";
        Log.d("name", name);
        Log.d("namebytelen", String.valueOf(z.length));
        //Log.d("namebyte", String.valueOf(z[0])+" "+String.valueOf(z[1])+" "+String.valueOf(z[2])+" "+String.valueOf(z[3])+" "+String.valueOf(z[4])+" "+String.valueOf(z[5]));

        if(bb.sendData(name.getBytes())){
            bb.upnameType=true;
            Log.d("sendData", "蓝牙改名发送成功");
        }else{
            Log.d("sendData", "蓝牙改名发送失败");
        }
    }

    @JavascriptInterface
    public void  queryVersion() {//查询版本
        if(bb.sendData(new byte[]{0x0C, (byte)128})){
            Log.d("setRobotMotor", "发送成功");
        }else{
            Log.d("setRobotMotor", "发送失败");
        }
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                if(bb.sendData(new byte[]{0x0C, (byte)128})){
                    Log.d("setRobotMotor", "发送成功");
                }else{
                    Log.d("setRobotMotor", "发送失败");
                }
            }
        }, 200);



    }

    @JavascriptInterface
    public void  sendData(String type,int data){//发送数据

        if(type.equals("motor-clockwise3")){
            type1=2;
            power1=motor_speed.get(data);
        }else if(type.equals("motor-clockwise4")){
            type2=2;
            power2=motor_speed.get(data);
        }else if(type.equals("motor-counterclockwise3")){
            type1=1;
            power1=motor_speed.get(data);
        }else if(type.equals("motor-counterclockwise4")){
            type2=1;
            power2=motor_speed.get(data);
        }else if(type.equals("motor-stop3")){

            type1=2;
            power1=0;
        }else if(type.equals("motor-stop4")){
            type2=2;
            power2=0;
        }else if(type.equals("motor_forward")){
            type1=1;
            type2=2;
            power1=motor_speed.get(data);;
            power2=motor_speed.get(data);;
        }else if(type.equals("motor_backward")){
            type1=2;
            type2=1;
            power1=motor_speed.get(data);;
            power2=motor_speed.get(data);;
        }else if(type.equals("motor_left")){
            type1=2;
            type2=2;
            power1=motor_speed.get(data);;
            power2=motor_speed.get(data);;
        }else if(type.equals("motor_right")){
            type1=1;
            type2=1;
            power1=motor_speed.get(data);;
            power2=motor_speed.get(data);;
        }else if(type.equals("motor_stopP")){
            type1=1;
            type2=1;
            power1=0;
            power2=0;
        }else if(type.equals("LED")){
            led=data;
        }else if(type.equals("INIT")){//初始化发送数据
            type1= 1;
            power1= 0;
            type2= 1;
            power2= 0;
            led=0;
        }

        //校验和
        //int i_sum=Integer.parseInt("0A",16)+type1+power1+type2+power2+led;
        Log.d("sendData", String.valueOf(type1)+" "+String.valueOf(power1)+" "+String.valueOf(type2)+" "+String.valueOf(power2)+" "+String.valueOf(led));
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                if(bb.sendData(new byte[]{0x0A, (byte)type1,(byte)power1, (byte)type2,(byte)power2,(byte)led,0x00, 0x20,0x20,0x20, 0x20,0x20,0x20, 0x20,0x20,0x20, 0x20,0x20,0x20, 0x0A})){//(byte)(i_sum%256)
                    Log.d("sendData", "发送成功");
                }else{
                    Log.d("sendData", "发送失败");
                }
            }
        }, 100);


    }

    /*
    @JavascriptInterface
    public void  setRobotMotor(String value,int speed){//电机

        int pin=  3;
        int power= speed*25;
        int type= 1;

        //端口
        if(value.substring(value.length()-1).equals("3")){
            pin=3;
        }else if(value.substring(value.length()-1).equals("4")){
            pin=4;
        }

        //转动类型
        if(value.substring(0,value.length()-1).equals("motor-clockwise")){
            type=1;
        }else if(value.substring(0,value.length()-1).equals("motor-counterclockwise")){
            type=2;
        }else{
            type=3;
        }

        //校验和
        int i_sum=Integer.parseInt("0A",16)+pin+power+type;//A+3+1+?

        if(bb.sendData(new byte[]{0x0A, (byte)pin,(byte)type, (byte)power, (byte)(i_sum%256)})){
            Log.d("setRobotMotor", "发送成功");
        }else{
            Log.d("setRobotMotor", "发送失败");
        }

    }*/


    public void  setRobotLed(String value) {//led
        int pin=  5;//端口
        int type= 1;//led
        int color = Integer.parseInt(value.substring(0,value.length()-1));//颜色

        //校验和
        int i_sum=Integer.parseInt("0A",16)+pin+color+type;

        if(bb.sendData(new byte[]{0x0A, (byte)pin,(byte)type, (byte)color, (byte)(i_sum%256)})){
            Log.d("setRobotMotor", "发送成功");
        }else{
            Log.d("setRobotMotor", "发送失败");
        }
    }


    @JavascriptInterface
    public int setRobotMove(String type) {
        //byte[] test=new byte[]{0x0A,0x03,0x01, (byte) 0xFF,0x0d};


        if(type.equals("forward")){
            bb.sendData(new byte[]{0x0A, 0x04, 0x01, (byte) 0xFF, 0x0e});
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    bb.sendData(new byte[]{0x0A, 0x03, 0x01, (byte) 0xFF, 0x0d});
                }
            }, 100);

        }else if(type.equals("back")){
            bb.sendData(new byte[]{0x0A, 0x04, 0x02, (byte) 0xFF, 0x0f});
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    bb.sendData(new byte[]{0x0A, 0x03, 0x02, (byte) 0xFF, 0x0e});
                }
            }, 150);

        }else if(type.equals("left")){
            bb.sendData(new byte[]{0x0A, 0x04, 0x01, (byte) 0xFF, 0x0e});
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    bb.sendData(new byte[]{0x0A, 0x03, 0x02, (byte) 0xFF, 0x0e});
                }
            }, 150);

        }else if(type.equals("right")){
            bb.sendData(new byte[]{0x0A, 0x04, 0x02, (byte) 0xFF, 0x0f});
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    bb.sendData(new byte[]{0x0A, 0x03, 0x01, (byte) 0xFF, 0x0d});
                }
            }, 150);

        }else if(type.equals("stop")){
            bb.sendData(new byte[]{0x0A, 0x04, 0x03, (byte) 0xFF, 0x00});
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    bb.sendData(new byte[]{0x0A, 0x03, 0x03, (byte) 0xFF, 0x0f});
                }
            }, 150);

        }
        /*if(bb.sendData(test)){
            Log.d("ssss", "_______________111111111111111______________");
        }else{
            Log.d("ffffff", "_______________111111111111111______________");
        }*/


        return 0;
    }
    public int cameraPermissionResult = PackageManager.PERMISSION_DENIED;
    public int micPermissionResult = PackageManager.PERMISSION_DENIED;
    @JavascriptInterface
    public void  getLimits() {
        Log.d("ssss", "_______________申请权限______________");
        _activity.requestPermissions();
    }

    @JavascriptInterface
    public void  selectMicPermissionResult(String loc) {//检测录音权限并开启
        Boolean a = _activity.requestMicPermissions(loc);
        Log.d("ssss", "_______________录音权限______________"+a);
    }

    @JavascriptInterface
    public void  selectCameraPermissionResult(String loc) {//检测相机权限并开启
        Boolean a = _activity.requestCameraPermissions(loc);
        Log.d("ssss", "_______________相机权限______________"+a);
    }

//    @JavascriptInterface
//    public void  openAI() {//ai
//        Intent intent = new Intent(_activity, AIWebViewActivity.class);
//        _activity.startActivity(intent);
//    }

    @JavascriptInterface
    public void openAI(final String moduleType,String loc) {
        Boolean a = _activity.requestCameraPermissions_ai(loc);
        if(!a){
            _activity.requestCameraPermissions(loc);
        }else{
            _activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    _activity.showAIWindow(moduleType);
                }
            });
        }
    }

    @JavascriptInterface
    public void closeAI() {
        _activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                _activity.closeAIWindow();
            }
        });
    }




    @JavascriptInterface
    public void  showRobotSearchingState() {
        synchronized (this) {
            if (bd.isSeraching) {
                bd.dialogLoading.show();
            }
        }
    }



    @JavascriptInterface
    public void SjrFileChoose(){

        synchronized (this) {

            Log.i("[FileChooser]","SjrFileChoose()");

            FileChooser fc = new FileChooser(_activity);


            fc.setFileListener(fsl);
            fc.setExtension("sjr");

            fc.Choose_File();

            fc.showDialog();

        }

    }

    public void SendBase64SjrFile(){




    }


    @JavascriptInterface
    public void SjrFileSave(String filename, String base64ContentStr){


          /* try {

               _activity._ioManager.setFile(filename, base64ContentStr);

           }catch(IOException e){


           } */


          FileSaver fs = new FileSaver(_activity);

          //fs.setExtension("sjr");

        fs.Save_File_Dialog(filename, base64ContentStr);

        fs.showDialog();


    }
    @JavascriptInterface
    public void exitBAY() {
        System.exit(0);
    }
    @JavascriptInterface
    public void getLung() {
        Locale currentLocale;
        currentLocale = Locale.getDefault(); // 获取默认语言

        String language = currentLocale.getLanguage();
        String country = currentLocale.getCountry();
        System.out.println("语言 Code: " + language);
        System.out.println("国家 Code: " + country);
        String a="YSXY.setLanguageYSXY('"+language+"')";
        _activity.runJavaScript(a);
    }


    @JavascriptInterface
    public void steVtype() {
        _activity.steVtype();
    }

//
    @JavascriptInterface
    public void notifySplashDone() {
        Log.i(LOG_TAG, "启动画面完成加载");
        _activity.setSplashDone(true);
    }

    @JavascriptInterface
    public void notifyDoneLoading() {
        Log.i(LOG_TAG, "应用程序完成加载");
        _activity.setAppInitialized(true);
    }

    @JavascriptInterface
    public void notifyEditorDoneLoading() {
        Log.i(LOG_TAG, "编辑器完成加载");
        _activity.setEditorInitialized(true);
    }

    //////////////////////////////////////////////////////////////////////
    // audio_*

    @JavascriptInterface
    public void audio_sndfx(String file) {
        SoundManager soundManager = _activity.getSoundManager();
        soundManager.playSoundEffect(file);
    }

    @JavascriptInterface
    public void audio_sndfxwithvolume(String file, float volume) {
        SoundManager soundManager = _activity.getSoundManager();
        soundManager.playSoundEffectWithVolume(file, volume);
    }

    @JavascriptInterface
    public int audio_play(String file, float volume) {
        SoundManager soundManager = _activity.getSoundManager();
        return soundManager.playSound(file);
    }

    @JavascriptInterface
    public boolean audio_isplaying(int soundId) {
        SoundManager soundManager = _activity.getSoundManager();
        return soundManager.isPlaying(soundId);
    }

    @JavascriptInterface
    public void audio_stop(int soundId) {
        SoundManager soundManager = _activity.getSoundManager();
        soundManager.stopSound(soundId);
    }

    //////////////////////////////////////////////////////////////////////
    // database_*

    @JavascriptInterface
    public String database_query(String json) {
        String result;
        try {
            JSONObject obj = new JSONObject(json);
            String stmt = obj.getString("stmt");
            JSONArray valuesJSONArray = obj.getJSONArray("values");
            String[] values = ScratchJrUtil.jsonArrayToStringArray(valuesJSONArray);
            DatabaseManager databaseManager = _activity.getDatabaseManager();
            result = databaseManager.query(stmt, values).toString();
        } catch (JSONException e) {
            result = "JSON error: " + e.getMessage();
        } catch (DatabaseException e) {
            result = "SQL error: " + e.getMessage();
        }
        return result;
    }

    @JavascriptInterface
    public String database_stmt(String json) {
        String result;
        try {
            JSONObject obj = new JSONObject(json);
            String stmt = obj.getString("stmt");
            JSONArray valuesJSONArray = obj.getJSONArray("values");
            String[] values = ScratchJrUtil.jsonArrayToStringArray(valuesJSONArray);
            DatabaseManager databaseManager = _activity.getDatabaseManager();
            result = databaseManager.stmt(stmt, values).toString();
        } catch (JSONException e) {
            result = "JSON error: " + e.getMessage();
        } catch (DatabaseException e) {
            result = "SQL error: " + e.getMessage();
        }
        return result;
    }

    //////////////////////////////////////////////////////////////////////
    // io_*

    @JavascriptInterface
    public String io_getmd5(String str) {
        IOManager ioManager = _activity.getIOManager();
        return ioManager.md5(str);
    }

    @JavascriptInterface
    public String io_getsettings() {
        String homeDirectory = "";
        String choice = "";
        String soundPermission = (_activity.micPermissionResult == PackageManager.PERMISSION_GRANTED) ? "YES" : "NO";
        String cameraPermission = (_activity.cameraPermissionResult == PackageManager.PERMISSION_GRANTED) ? "YES" : "NO";
        return homeDirectory + "," + choice + "," + soundPermission + "," + cameraPermission;
    }

    @JavascriptInterface
    public void io_cleanassets(String fileType) {
        IOManager ioManager = _activity.getIOManager();
        try {
            ioManager.cleanAssets(fileType);
        } catch (IOException e) {
            Log.e(LOG_TAG, "Could not clean assets", e);
        }
    }

    @JavascriptInterface
    public String io_setfile(String filename, String base64ContentStr) {
        String result;
        IOManager ioManager = _activity.getIOManager();
        try {
            result = ioManager.setFile(filename, base64ContentStr);
        } catch (IOException e) {
            Log.e(LOG_TAG, "Could not set file '" + filename + "'", e);
            result = "-1";
        }
        return result;
    }

    @JavascriptInterface
    public String io_getfile(String filename) {
        String result;
        IOManager ioManager = _activity.getIOManager();
        try {
            result = ioManager.getFile(filename);
        } catch (IOException e) {
            Log.e(LOG_TAG, "Could not get file '" + filename + "'", e);
            result = "";
        }
        return result;
    }

    @JavascriptInterface
    public String io_setmedia(String base64ContentStr, String extension) {
        String result;
        IOManager ioManager = _activity.getIOManager();
        try {
            result = ioManager.setMedia(base64ContentStr, extension);
        } catch (IOException e) {
            Log.e(LOG_TAG, "Could not set media of type '" + extension + "'", e);
            result = "-1";
        }
        return result;
    }

    @JavascriptInterface
    public String io_setmedianame(String contents, String key, String ext) {
        String result;
        IOManager ioManager = _activity.getIOManager();
        try {
            result = ioManager.setMediaName(contents, key, ext);
        } catch (IOException e) {
            Log.e(LOG_TAG, "Could not set media name of key '" + key + "' ext '" + ext + "'", e);
            result = "-1";
        }
        return result;
    }

    @JavascriptInterface
    public String io_getmedia(String filename) {
        String result;
        IOManager ioManager = _activity.getIOManager();
        try {
            result = ioManager.getMedia(filename);
        } catch (IOException e) {
            Log.e(LOG_TAG, "Could not get media with filename '" + filename + "'", e);
            result = "-1";
        }
        return result;
    }

    @JavascriptInterface
    public String io_getmediadata(String filename, int offset, int length) {
        IOManager ioManager = _activity.getIOManager();
        return ioManager.getMediaData(filename, offset, length);
    }

    @JavascriptInterface
    public int io_getmedialen(String file, String key) {
        int result;
        IOManager ioManager = _activity.getIOManager();
        try {
            result = ioManager.getMediaLen(file, key);
        } catch (IOException e) {
            Log.e(LOG_TAG, "Could not get media len for file '" + file + "' key '" + key + "'", e);
            result = 0;
        }
        return result;
    }

    @JavascriptInterface
    public String io_getmediadone(String filename) {
        IOManager ioManager = _activity.getIOManager();
        ioManager.getMediaDone(filename);
        return "1";
    }

    @JavascriptInterface
    public String io_remove(String filename) {
    	String result;
    	IOManager ioManager = _activity.getIOManager();

    	Log.d(LOG_TAG, "Trying to remove filename '" + filename + "'");

    	try {
    		result = ioManager.remove(filename) ? "1" : "-1";
    	} catch (IOException e) {
    		Log.e(LOG_TAG, "Could not remove file '" + filename + "'", e);
    		result = "-1";
    	}
    	return result;
    }

    //////////////////////////////////////////////////////////////////////
    // recordsound_*

    @JavascriptInterface
    public String recordsound_recordstart() {
        SoundRecorderManager soundRecorderManager = _activity.getSoundRecorderManager();
        String soundFile = soundRecorderManager.startRecord();
        return (soundFile == null) ? "-1" : soundFile;
    }

    @JavascriptInterface
    public String recordsound_recordstop() {
        SoundRecorderManager soundRecorderManager = _activity.getSoundRecorderManager();
        try {
            return soundRecorderManager.stopRecord() ? "1" : "-1";
        } catch (Throwable t) {
            Log.e(LOG_TAG, "Error stopping recording", t);
            return "-1";
        }
    }

    @JavascriptInterface
    public double recordsound_volume() {
        SoundRecorderManager soundRecorderManager = _activity.getSoundRecorderManager();
        return soundRecorderManager.getVolume();
    }

    @JavascriptInterface
    public String recordsound_startplay() {
        SoundRecorderManager soundRecorderManager = _activity.getSoundRecorderManager();
        try {
            return Double.toString(soundRecorderManager.startPlay());
        } catch (IllegalStateException e) {
            Log.e(LOG_TAG, "Error starting play", e);
            return "ERROR: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String recordsound_stopplay() {
        SoundRecorderManager soundRecorderManager = _activity.getSoundRecorderManager();
        try {
            soundRecorderManager.stopPlay();
            return "1";
        } catch (IllegalStateException e) {
            Log.e(LOG_TAG, "Error stopping play", e);
            return "-1";
        }
    }

    @JavascriptInterface
    public String recordsound_recordclose(String keep) {
        boolean keepBoolean = !keep.toLowerCase(Locale.US).equals("no");
        SoundRecorderManager soundRecorderManager = _activity.getSoundRecorderManager();
        soundRecorderManager.recordClose(keepBoolean);
        return keepBoolean ? "1" : "-1";
    }

    //////////////////////////////////////////////////////////////////////
    // scratchjr_*

    @JavascriptInterface
    public String scratchjr_cameracheck() {
        return _activity.getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY) ? "1" : "0";
    }
    
    @JavascriptInterface
    public boolean scratchjr_has_multiple_cameras() {
        return Camera.getNumberOfCameras() > 1;
    }

    @JavascriptInterface
    public String scratchjr_startfeed(String str) {
        try {
            JSONObject obj = new JSONObject(str);
            String imageDataStr = obj.getString("image");
            if (!imageDataStr.startsWith("data:image/png")) {
                Log.e(LOG_TAG, "Expecting data URL for image data but got '" + imageDataStr + "'");
                return "-1";
            }
            String base64ImageData = imageDataStr.substring(imageDataStr.indexOf(";base64,") + 8);
            byte[] imageContent = Base64.decode(base64ImageData, Base64.NO_WRAP);

            float x = (float) obj.getDouble("x");
            float y = (float) obj.getDouble("y");
            float width = (float) obj.getDouble("width");
            float height = (float) obj.getDouble("height");
            RectF r = new RectF(x, y, x + width, y + height);

            float mx = (float) obj.getDouble("mx");
            float my = (float) obj.getDouble("my");
            float mw = (float) obj.getDouble("mw");
            float mh = (float) obj.getDouble("mh");
            RectF r2 = new RectF(mx, my, mx + mw, my + mh);

            float scale = (float) obj.getDouble("scale");
            float devicePixelRatio = (float) obj.getDouble("devicePixelRatio");
            openFeed(r, scale, devicePixelRatio, imageContent, r2);
        } catch (JSONException e) {
            Log.e(LOG_TAG, "Could not decode json: '" + str + "'", e);
            return "-1";
        }
        return "1";
    }

    @JavascriptInterface
    public String scratchjr_stopfeed() {
        closeFeed();
        return "1";
    }

    @JavascriptInterface
    public String scratchjr_choosecamera(String facing) {
        String result = "-1";
        if (_cameraView != null) {
            if (_cameraView.setCameraFacing(facing.equals("front"))) {
                result = "1";
            } else {
                result = "-1";
            }
        }
        return result;
    }

    @JavascriptInterface
    public void scratchjr_captureimage(final String onCameraCaptureComplete) {
        _cameraView.captureStillImage(
            new Camera.PictureCallback() {
                public void onPictureTaken(byte[] jpegData, Camera camera) {
                    sendBase64Image(onCameraCaptureComplete, jpegData);
                }
            },
            new Runnable() {
                public void run() {
                    Log.e(LOG_TAG, "Could not capture picture");
                    reportImageError(onCameraCaptureComplete);
                }
            }
        );
    }

    @JavascriptInterface
    public String scratchjr_getgettingstartedvideopath() {
        File cacheDir = _activity.getCacheDir();
        File videoFile = new File(cacheDir, "intro.mp4");
        if (!videoFile.exists()) {
            copyVideoToCacheDir();
        }
        if (!videoFile.exists()) {
            Log.w(LOG_TAG, "Video file does not exist after copying: '" + videoFile.getPath() + "'");
        }
        return videoFile.getPath();
    }

    @JavascriptInterface
    public String scratchjr_stopserver() {
        // On Android, we don't use an HTTP server - everything gets invoked directly.
        return "1";
    }

    @JavascriptInterface
    public void scratchjr_setsoftkeyboardscrolllocation(int topYPx, int bottomYPx) {
        _activity.setSoftKeyboardScrollLocation(topYPx, bottomYPx);
    }

    /**
     * Pop up the soft keyboard if this is not a hardware-keyboard device.
     */
    @JavascriptInterface
    public void scratchjr_forceShowKeyboard() {
        InputMethodManager mgr = (InputMethodManager) _activity.getSystemService(Context.INPUT_METHOD_SERVICE);
        mgr.showSoftInput(_activity.getCurrentFocus(), InputMethodManager.SHOW_IMPLICIT);
    }

    /**
     * Hide the soft keyboard if this is not a hardware-keyboard device.
     * 隐藏软键盘，如果这不是一个硬件键盘设备。
     */
    @JavascriptInterface
    public void scratchjr_forceHideKeyboard() {
        InputMethodManager mgr = (InputMethodManager) _activity.getSystemService(Context.INPUT_METHOD_SERVICE);
        mgr.hideSoftInputFromWindow(_activity.getCurrentFocus().getWindowToken(), 0);
    }

    private void sendBase64Image(String onCameraCaptureComplete, byte[] jpegData) {
        Bitmap bitmap = BitmapFactory.decodeByteArray(jpegData, 0, jpegData.length);
        Log.i(LOG_TAG, "Picture size: " + bitmap.getWidth() + " x " + bitmap.getHeight());
        int exifRotation = CameraExif.getOrientation(jpegData);
        Log.i(LOG_TAG, "Picture rotation: " + exifRotation);
        byte[] translatedJpegData = _cameraView.getTransformedImage(bitmap, exifRotation);
        String base64Data = Base64.encodeToString(translatedJpegData, Base64.NO_WRAP);
        closeFeed();
        _activity.runJavaScript(onCameraCaptureComplete + "('" + base64Data + "');");
    }

    private void reportImageError(String onCameraCaptureComplete) {
        _activity.runJavaScript(onCameraCaptureComplete + "('error getting a still');");
    }

    private void openFeed(final RectF rect, final float scale, final float devicePixelRatio, final byte[] maskImageData,
        final RectF maskRect)
    {
        _activity.runOnUiThread(new Runnable() {
            public void run() {
                _activity.translateAndScaleRectToContainerCoords(rect, devicePixelRatio);
                _activity.translateAndScaleRectToContainerCoords(maskRect, devicePixelRatio);
                scaleRectFromCenter(rect, scale);
                scaleRectFromCenter(maskRect, scale);
                RelativeLayout container = _activity.getContainer();

                _cameraView = new CameraView(_activity, rect, scale * devicePixelRatio, true); // always start with front-facing camera
                container.addView(_cameraView, new RelativeLayout.LayoutParams((int) (rect.width()), (int) (rect.height())));
                _cameraView.setX(rect.left);
                _cameraView.setY(rect.top);

                _cameraMask = new ImageView(_activity);
                Bitmap bitmap = BitmapFactory.decodeByteArray(maskImageData, 0, maskImageData.length);
                _cameraMask.setImageBitmap(bitmap);
                container.addView(_cameraMask, new RelativeLayout.LayoutParams((int) (maskRect.width()), (int) (maskRect.height())));
                _cameraMask.setX(maskRect.left);
                _cameraMask.setY(maskRect.top);
            }
        });
    }

    private void scaleRectFromCenter(RectF rect, float scale) {
        float deltaWidth = rect.width() * scale - rect.width();
        float deltaHeight = rect.height() * scale - rect.height();
        rect.left -= deltaWidth / 2;
        rect.top -= deltaHeight / 2;
        rect.right += deltaWidth / 2;
        rect.bottom += deltaHeight / 2;
    }

    private void closeFeed() {
        _activity.runOnUiThread(new Runnable() {
            public void run() {
                RelativeLayout container = _activity.getContainer();
                if (_cameraView != null) {
                    container.removeView(_cameraView);
                    _cameraView = null;
                }
                if (_cameraMask != null) {
                    container.removeView(_cameraMask);
                    _cameraMask = null;
                }
            }
        });
    }

    private void copyVideoToCacheDir() {
        InputStream in = null;
        OutputStream out = null;
        try {
            File cacheDir = _activity.getCacheDir();
            File videoFile = new File(cacheDir, "intro.mp4");
            byte[] buffer = new byte[1024];
            int len;
            in = _activity.getAssets().open("HTML5/assets/lobby/intro.mp4");
            out = new FileOutputStream(videoFile);
            while ((len = in.read(buffer)) != -1) {
                out.write(buffer, 0, len);
            }
        } catch (IOException e) {
            Log.e(LOG_TAG, "Could not copy video to cache dir", e);
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (IOException e) {
                    Log.e(LOG_TAG, "Could not close input stream while copying video file", e);
                }
            }
            if (out != null) {
                try {
                    out.close();
                } catch (IOException e) {
                    Log.e(LOG_TAG, "Could not close output stream while copying video file", e);
                }
            }
        }
    }

    //////////////////////////////////////////////////////////////////////
    // Sharing

    @JavascriptInterface
    public String deviceName() {
        return android.os.Build.MODEL;
    }

    @JavascriptInterface
    public void sendSjrUsingShareDialog(String fileName, String emailSubject,
                                        String emailBody, int shareType, String b64data) {
        // Write a temporary file with the project data passed in from JS
        File tempFile;

        String extension;
        if (BuildConfig.APPLICATION_ID.equals("org.pbskids.robbojunior")) {
            extension = ".psjr";
        } else {
            extension = ".sjr";
        }

        try {
            fileName = fileName + extension;
            tempFile = new File(_activity.getCacheDir() + File.separator + fileName);
            tempFile.createNewFile();
            BufferedOutputStream bw = new BufferedOutputStream(new FileOutputStream(tempFile));
            // Decode and write the data
            bw.write(Base64.decode(b64data, Base64.DEFAULT));
            bw.flush();
            bw.close();
        } catch (IOException e) {
            return;
        }

        final Intent it = new Intent(Intent.ACTION_SEND);
        it.setType("message/rfc822");
        it.putExtra(android.content.Intent.EXTRA_EMAIL, new String[] {});
        it.putExtra(android.content.Intent.EXTRA_SUBJECT, emailSubject);
        it.putExtra(android.content.Intent.EXTRA_TEXT, Html.fromHtml(emailBody));

        // The stream data is a reference to the temporary file provided by our contentprovider
        it.putExtra(Intent.EXTRA_STREAM,
                Uri.parse("content://" + ShareContentProvider.AUTHORITY + "/"
                        + fileName));

        _activity.startActivity(it);
    }

    // Analytics
    @JavascriptInterface
    public void analyticsEvent(String category, String action, String label, long value) {
//        _application.getDefaultTracker().send(new HitBuilders.EventBuilder()
//                .setCategory(category).setAction(action).setLabel(label).setValue(value).build());
    }
}
