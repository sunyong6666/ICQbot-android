package org.icqbot.android;



import static android.app.PendingIntent.getActivity;
import static android.content.ContentValues.TAG;
import static android.content.pm.PackageManager.PERMISSION_GRANTED;

import static java.lang.Math.abs;

import android.Manifest;

import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.bluetooth.BluetoothAdapter;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanFilter;

import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.BroadcastReceiver;
import android.content.Context;

import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelUuid;

import android.provider.Settings;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.DisplayMetrics;
import android.util.Log;
import android.widget.Toast;


import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;


public class BlueBle {
    private boolean already_clicked = false;
    public  boolean isSeraching = false;
    private BluetoothManager bleBlueMg;
    private BluetoothAdapter mAdepter;//本机
    private BluetoothLeScanner mScanner; //扫描
    private RobbojuniorActivity mActivity;

    //窗口
    private volatile AlertDialog.Builder builder;
    public volatile RobotProgressDialog dialogLoading;
    private  AlertDialog  item_dialog_instance;

    public boolean flay= false;

    int Width,Height;

    //需要动态申请的权限数组、返回码
    private final String[] permissions = new String[]{
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION/*,

            //12yishang
            "android.permission.BLUETOOTH_SCAN",
            "android.permission.BLUETOOTH_ADVERTISE",
            "android.permission.BLUETOOTH_CONNECT"*/

    };
    private final int PERMISSIONS_RESULT_CODE = 121;// 自定义

    //扫描相关
    boolean scing = false;//是否正在扫描
    List<ScanFilter> filters = new ArrayList<ScanFilter>();
    ScanSettings settings = null;

    String connName="";//目前连接蓝牙的名字

    BluetoothGattCallback mBluetoothGattCallback;
    BluetoothGatt bluetoothGatt=null;
    BluetoothGattService mBluetoothGattService ;

    boolean joining = false;//是否正在连接
    boolean locationConnection = false;//是否在定位连接当中
    private BluetoothDevice lastConnectedDevice;//上一次连接的设备
    private int disType=0;//断开状态：0:正常断开，1：切换时断开
    int reconnect_num=0;

    boolean isDiscoverServices = false;//是否开启服务
    private Handler timeoutHandler = new Handler();
    private Runnable timeRunnable = new Runnable() {
        @Override
        public void run() {
            //
            if(isDiscoverServices){
                stopServiceDiscovery();
                handleServiceDiscoveryTimeout();
            }
        }
    };
    public boolean upnameType=false;//蓝牙改名后不再重新连接
    //JDY
   /* String s_uuid="0000ffe0-0000-1000-8000-00805f9b34fb";
    String c_write_uuid="0000ffe1-0000-1000-8000-00805f9b34fb";*/

    //新版本的，老版硬件彻底艘不到了
    String s_uuid="0000ffe0-0000-1000-8000-00805f9b34fb";
    String c_write_uuid="0000ffe1-0000-1000-8000-00805f9b34fb";
    String c_notif_uuid="0000ffe1-0000-1000-8000-00805f9b34fb";//读

    String s_uuid_new="0000eee0-0000-1000-8000-00805f9b34fb";
    String c_write_uuid_new="0000eee2-0000-1000-8000-00805f9b34fb";//
    String c_notif_uuid_new="0000eee1-0000-1000-8000-00805f9b34fb";//读

    BleScanCallback mScanCallback;

    DisplayMetrics displayMetrics = new DisplayMetrics();

    BluetoothGattCharacteristic bluetoothGattCharacteristic= null;

    int a=0;//权限次数

    String main_ble_zd = "";


    public BlueBle(final RobbojuniorActivity activity){
        //this.already_clicked = false;
        mActivity = activity;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            bleBlueMg = (BluetoothManager) activity.getSystemService(Context.BLUETOOTH_SERVICE);
            mAdepter = bleBlueMg.getAdapter();
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mScanner = mAdepter.getBluetoothLeScanner();

            //filters.add(new ScanFilter.Builder().setServiceUuid(new ParcelUuid(UUID.fromString(s_uuid))).build());
            settings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();//高功率
        }

        //获取屏幕宽高
        mActivity.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        Width = displayMetrics.widthPixels;
        Height = displayMetrics.heightPixels;


        //连接回调
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            mBluetoothGattCallback = new BluetoothGattCallback() {
                @Override
                public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                    super.onConnectionStateChange(gatt, status, newState);
                    Log.d(TAG, "onConnectionStateChange: " + status);
                    Log.d(TAG, "onConnectionStateChange-newState: " + newState);

                    if(locationConnection){
                        Log.d(TAG, "onConnectionStateChange:  定位连接结束，发送数据到前台");
                        locationConnection=false;
                        mActivity.rssi_type();
                    }

                    if (status == BluetoothGatt.GATT_FAILURE){
                        Log.d(TAG, "onConnectionStateChange:  执行连接失败状态  直接退");
                        bluetoothGatt.close();
                        return;
                    }
//                    if (status == 133 || status == 34 ){
//                        //joining=false;
//                        Log.d(TAG, "onConnectionStateChange:  异常状态，重新连接");
//                        reconnectLast();
//                        return;
//                    }

                    switch (newState) {
                        case BluetoothProfile.STATE_CONNECTING:
                            Log.d(TAG, "onConnectionStateChange:  connectting");
                            break;
                        case BluetoothProfile.STATE_CONNECTED://连接成功  2
                            Log.d(TAG, "onConnectionStateChange: 连接成功");
                            disType=0;
                            reconnect_num=0;
                            connName=bluetoothGatt.getDevice().getName();
                            upnameType=false;
                            joining=false;
                            stopscanBlueTooth();//停止扫描设备
                            mActivity.conn(connName);//发送连接成功--位置应在正确打开服务下
                            isDiscoverServices = true;
                            boolean su = bluetoothGatt.discoverServices();//获取服务（）
                            if(!su){
                                Log.d(TAG, "onConnectionStateChange: NONONONONO");
                            }else{
                                Log.d(TAG, "检测服务开启？");
                                //timeoutHandler.postDelayed(timeRunnable,2000);
                            }
                            break;
                        case BluetoothProfile.STATE_DISCONNECTING:
                            Log.d(TAG, "onConnectionStateChange: disconnecting");
                            break;
                        case BluetoothProfile.STATE_DISCONNECTED://断开连接  0
                            Log.d(TAG, "onConnectionStateChange: 断开连接");
                            //joining=false;

                           // mActivity.sensorInit();
                            bluetoothGatt.close();
                            connName="";
                            mActivity.disconn();

//                            if(upnameType){//刚刚改名
//                                Log.d(TAG, "刚改完名，不重联了");
//                            }else{
//                                if(lastConnectedDevice!=null && disType==0 ){//非正常点击断开时重联
//                                    Log.d(TAG, "非正常断开，重联");
//                                    reconnectLast();
//                                }
//                            }


                            break;
                        default:
                            Log.d(TAG, "onConnectionStateChange: other connect state: " + status);
                            break;
                    }
                }

                //服务回调
                @Override
                public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                    super.onServicesDiscovered(gatt, status);

                    isDiscoverServices=false;


                    if(status == BluetoothGatt.GATT_SUCCESS) {
                        List<BluetoothGattService> mGattServices =  gatt.getServices();
                        //Log.d(TAG, "*******************************   "+
                        //获取服务
                        for (BluetoothGattService service: mGattServices) {
                            if (service.getUuid().toString().equalsIgnoreCase(s_uuid) || service.getUuid().toString().equalsIgnoreCase(s_uuid_new)) {//
                                mBluetoothGattService = service;
                                break;
                            }
                        }

                        //读取数据的特征
                        BluetoothGattCharacteristic mBluetoothGattCharacteristic_r=null;

                        //写入数据的特征
                        if (mBluetoothGattService.getUuid().toString().equalsIgnoreCase(s_uuid)) {
                            bluetoothGattCharacteristic = mBluetoothGattService.getCharacteristic(UUID.fromString(c_write_uuid));
                            mBluetoothGattCharacteristic_r=mBluetoothGattService.getCharacteristic(UUID.fromString(c_notif_uuid));
                        }else{
                            bluetoothGattCharacteristic = mBluetoothGattService.getCharacteristic(UUID.fromString(c_write_uuid_new));
                            mBluetoothGattCharacteristic_r=mBluetoothGattService.getCharacteristic(UUID.fromString(c_notif_uuid_new));
                        }


                        //注册通知
                        Log.d("notify", "_______________注册通知______________");

                        if(bluetoothGatt.setCharacteristicNotification(mBluetoothGattCharacteristic_r,true)){
                            Log.d("notify", "_______________注册通知--成功______________");
                            BluetoothGattDescriptor descriptor = mBluetoothGattCharacteristic_r.getDescriptor(UUID.fromString("00002902-0000-1000-8000-00805f9b34fb"));

                            descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                            bluetoothGatt.writeDescriptor(descriptor);
                        }

                        //mGattServices = (ArrayList<BluetoothGattService>) gatt.getServices();
                    } else {
                        bluetoothGatt.close();
                        bluetoothGatt=null;
                        Log.d("service", "_______________无服务______________");
                    }
                }


                //notify回调
                @Override
                public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {

                    byte[] data = characteristic.getValue();
                    String s = "";
                    for(byte a:data){
                        s+=(String.format("%2s",Integer.toHexString(a&0xFF).toUpperCase(Locale.ROOT)).replace(" ","0")) ;
                    }
                    //Log.d("service", s);
                    mActivity.set_data(s);//发送数据
                }
            };
        }

        //扫描到设备回调
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            mScanCallback = new BleScanCallback() {
                @Override
                public void onScanResult(int callbackType, ScanResult result) {
                    super.onScanResult(callbackType, result);
                    //从结果中获取设备信息
                    BluetoothDevice device = result.getDevice();


                    if (device.getName()!=""  && isAdd(device.getAddress()) ) {//判断设备是否添加过并且名称不为空
                        if(device.getName().contains("BLOCK") || device.getName().contains("Block")){
                            return;
                        }
                        Log.d("scn", "-----------------发现新设备: "+device.getAddress());
                        JavaScriptDirectInterface.bleScanFilters.add(device);
                        mActivity.scan();
                        //item_dialog_instance.dismiss();
                        //showDeviceList();
                    }

                    double powe = (abs(result.getRssi())-59)/(10*2.0);
                    //String action = result.getAction();
                    //Log.d("scn", "-----------------发现*****: "+ powe);
                    if(connName.equals("")){

                            Log.d("scn", "-----------------发现*****: "+main_ble_zd+ powe);
                            if(main_ble_zd.equals("T") && powe<-0.7){
                                connectBluetooth(device.getAddress(),device.getName());
                                locationConnection=true;
                                //mActivity.rssi_type();
                            }

                    }
                }
            };
        }
    }


   //-------------------------------------------------------------------------------------------------------------------------------------------------------
    //扫描设备
    public void scanBlueTooth(String ble_zd,String loc) {
        Map<String, String> texts = getLocalizedTexts(loc);
        if (mAdepter == null) {
            Log.e("scanBlueTooth", "蓝牙适配器不可用");
            return;
        }

        if (!mAdepter.isEnabled()) {
            // 显示自定义弹窗
            new AlertDialog.Builder(mActivity)
                    .setTitle(texts.get("bluetooth_title"))
                    .setMessage(texts.get("enable_bluetooth_message"))
                    .setPositiveButton(texts.get("confirm"), new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            mAdepter.enable();
                        }
                    })
                    .setNegativeButton(texts.get("cancel"), new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            //Toast.makeText(mActivity, "蓝牙未启用，功能受限", Toast.LENGTH_SHORT).show();
                        }
                    })
                    .setCancelable(false)
                    .show();
            return;
        }

        // SDK版本 大于或等于23 动态申请权限
        if(Build.VERSION.SDK_INT < Build.VERSION_CODES.M){Log.d("scanBlueTooth", "SDK版本"); return;}
        // 检查 未授权 的 权限
        List<String> pl = new ArrayList<>();
        for(String permission : permissions){
            if(ContextCompat.checkSelfPermission(mActivity.getApplicationContext(),permission) != PERMISSION_GRANTED){
                pl.add(permission);
            }
        }


        // 检查权限并申请
        if (Build.VERSION.SDK_INT > 30) {
            final List<String> requiredPermissions = new ArrayList<>();
            if (ContextCompat.checkSelfPermission(mActivity.getApplicationContext(), "android.permission.BLUETOOTH_SCAN") != PERMISSION_GRANTED) {
                requiredPermissions.add("android.permission.BLUETOOTH_SCAN");
            }
            if (ContextCompat.checkSelfPermission(mActivity.getApplicationContext(), "android.permission.BLUETOOTH_ADVERTISE") != PERMISSION_GRANTED) {
                requiredPermissions.add("android.permission.BLUETOOTH_ADVERTISE");
            }
            if (ContextCompat.checkSelfPermission(mActivity.getApplicationContext(), "android.permission.BLUETOOTH_CONNECT") != PERMISSION_GRANTED) {
                requiredPermissions.add("android.permission.BLUETOOTH_CONNECT");
            }

            if (!requiredPermissions.isEmpty()) {
                Log.d("scanBlueTooth", "需要权限");

                // 显示权限申请对话框
                new AlertDialog.Builder(mActivity)
                        .setTitle("权限申请")
                        .setMessage("为了扫描和连接蓝牙设备，我们需要访问以下权限，请点击确认以授予权限。")
                        .setPositiveButton("确认", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                // 用户点击确认后发起权限申请
                                ActivityCompat.requestPermissions(mActivity, requiredPermissions.toArray(new String[0]), PERMISSIONS_RESULT_CODE);
                            }
                        })
                        .setNegativeButton("取消", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                dialog.dismiss(); // 用户取消申请，关闭对话框
                            }
                        })
                        .setCancelable(false)
                        .show();
                return;
            }
        }

        //位置信息开启
        LocationManager locationManager = (LocationManager) mActivity.getSystemService(Context.LOCATION_SERVICE);
        //判断是否开启了GPS
        boolean ok = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
        boolean ok_jr = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
        Log.d("蓝牙位置看这里", String.valueOf(ok));
        //若开启，申请权限
        if (!ok_jr && !ok) {
            //若未开启，弹框让用户选择去开
            new AlertDialog.Builder(mActivity)
                    .setIcon(android.R.drawable.ic_dialog_info)
                    .setTitle(texts.get("location_service_title"))
                    .setMessage(texts.get("enable_location_message"))
                    .setPositiveButton(texts.get("go_to_settings"), new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
                            Intent intent = new Intent(android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS);
                            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            mActivity.startActivity(intent);
                        }
                    })
                    .setNegativeButton(texts.get("cancel"), null)
                    .show();
            return;
        }

        a+=1;

        //禁止后不再提示
        //for (String permission : permissions) {
        if (a!=1 && pl.size() > 0 && ActivityCompat.checkSelfPermission(mActivity, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_DENIED) {
            if (!ActivityCompat.shouldShowRequestPermissionRationale(mActivity, Manifest.permission.ACCESS_COARSE_LOCATION)) {
                /**/
                AlertDialog alertDialog = new AlertDialog.Builder(mActivity)
                        .setTitle(texts.get("permission_request_title"))
                        .setMessage(texts.get("bluetooth_permission_message"))
                        .setPositiveButton(texts.get("go_to_settings"), new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                                intent.setData(Uri.fromParts("package", mActivity.getPackageName(), null));
                                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                mActivity.startActivity(intent);
                            }
                        })
                        .setNegativeButton(texts.get("cancel"),null)
                        .create();
                alertDialog.show();
            }
        }
        //}


        if(scing){
            return;
        }

        if(connName==""){
            joining=false;
        }

        main_ble_zd=ble_zd;
        scing=true;
        mActivity.set_scing("true");
        JavaScriptDirectInterface.bleScanFilters.clear();//清空设备列表
        Log.d("scanBlueTooth", "清空设备列表,扫描设备");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            //mScanner.startScan(mScanCallback);
            filters.add(0,new ScanFilter.Builder().setServiceUuid(new ParcelUuid(UUID.fromString(s_uuid))).build());
            filters.add(1,new ScanFilter.Builder().setServiceUuid(new ParcelUuid(UUID.fromString(s_uuid_new))).build());
            mScanner.startScan(filters,settings,mScanCallback);
        }
        flay = true;

        Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                stopscanBlueTooth();
            }
            }, 6000);//6秒后执行Runnable中的run方法
        //showWaitList();
        //showDeviceList();
    }

    private void startActivityForResult(Intent intent, int i) {
    }

    //停止扫描设备
    public void stopscanBlueTooth() {
        //JavaScriptDirectInterface.bleScanFilters.clear();//清空设备列表
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mScanner.stopScan(mScanCallback);
            scing=false;
            mActivity.set_scing("false");
        }
    }
    //连接蓝牙
    public void connectBluetooth(String id,String name) {

        if(joining){
            Log.d("join", "有设备正在连接中，当前连接请求被退回");
            return;
        }

        Log.d("join", "连接状态正常，进入连接程序");
        Log.d("join", id);

        lastConnectedDevice = null;//正常断开
        disType=1;
        reconnect_num=0;
        for (BluetoothDevice device : JavaScriptDirectInterface.bleScanFilters) {
            Log.d("sendData", device.getAddress());
            Log.d("sendData", id);
            if(device.getAddress().equals(id)){
                bluetoothGatt=connectBlueTooth(device,false,mBluetoothGattCallback);//第二个参数true表示设备断开会不断尝试自动重联，false表示之进行一次尝试
                break;
            }

        }
    }




    /**
     * 连接蓝牙
     *
     */
    public BluetoothGatt connectBlueTooth(BluetoothDevice device, boolean autoConnect, BluetoothGattCallback gattCallback) {
        Log.d("TAG", "connectBlueTooth: 连接设备");
        if(joining){
            Log.d("join", "有设备正在连接中，当前连接请求被退回");
            return null;
        }
        joining=true;
        lastConnectedDevice = device;
        BluetoothGatt a = null;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2 && device!=null) {
            if(bluetoothGatt!=null) {
                bluetoothGatt.disconnect();
                bluetoothGatt.close();
            }

            a=device.connectGatt(this.mActivity, autoConnect, gattCallback);
            Log.d("connectBlueTooth", "12121");
            a.connect();
/*
            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override
                public void run() {
                    Log.d("connectBlueTooth", String.valueOf(bluetoothGatt)+"   "+connName);
                    if(bluetoothGatt!=null && connName=="" && reconnect_num<3){
                        Log.d("connectBlueTooth", "连接超时了老弟");
                        reconnect_num+=1;
                        reconnectLast();
                    }else if(reconnect_num==3){
                        reconnect_num=0;
                    }
                }
            },1500);*/
        }
        return a;
    }

    /**
     * 发送数据
     *
     */
    public boolean sendData(byte[] test) {
        Log.d("send", "_______________准备发送数据_______________");
        if(bluetoothGatt==null){
            Log.d("send", "_______________bluetoothGatt为空_______________");
            return false;
        }
        if(mBluetoothGattService==null){
            Log.d("send", "_______________mBluetoothGattService为空_______________");
            return false;
        }
        if(bluetoothGattCharacteristic==null){
            Log.d("send", "_______________bluetoothGattCharacteristic为空_______________");
            return false;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            bluetoothGattCharacteristic.setValue(test);
            Log.d("send", "_______________发送数据______________");
            return bluetoothGatt.writeCharacteristic(bluetoothGattCharacteristic);
        }
        return false;
    }

    //判断设备是否添加
    private boolean isAdd( String Address) {
        for (BluetoothDevice current : JavaScriptDirectInterface.bleScanFilters) {
            if (Address.equals(current.getAddress())){
                return false;
            }
        }
        return true;
    }


    //断开
    public void disconnect(){
        if(bluetoothGatt==null){
            return;
        }
        //joining=false;//4.14
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            bluetoothGatt.disconnect();
            //bluetoothGatt.close();
            //connName="";
            //mActivity.disconn();
            Log.d("disconnect", "_______________断开______________");
            lastConnectedDevice = null;//正常断开
            //scanBlueTooth(main_ble_zd);
        }
    }
    public void disconnect_type(){
        if(bluetoothGatt==null){
            return;
        }
        lastConnectedDevice = null;
    }

    //获取当前连接蓝牙名称
    public void getBLEstate() {
        mActivity.conn(connName);//发送当前连接蓝牙名称
    }


    public void setBleZD(String zd) {
        main_ble_zd=zd;
    }

    //重新连接
    public void reconnectLast(){
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            bluetoothGatt.disconnect();
            bluetoothGatt.close();
        }

        connName="";
        mActivity.disconn();
        joining=false;
        Log.d("111", "_______________重新连接中______________"+lastConnectedDevice.getName());
        bluetoothGatt=connectBlueTooth(lastConnectedDevice,false,mBluetoothGattCallback);//第二个参数true表示设备断开会不断尝试自动重联，false表示之进行一次尝试
        //connName=bluetoothGatt.getDevice().getName();
    }




    private void stopServiceDiscovery(){
        isDiscoverServices = false;
        //bluetoothGatt.cancelDiscovery();
        Log.d("disconnect", "_______________stopServiceDiscovery______________");
        timeoutHandler.removeCallbacks(timeRunnable);
    }
    private void handleServiceDiscoveryTimeout(){
        Log.d("disconnect", "_______________服务超时未打开，重联______________");
        reconnectLast();
    }


    // 多语言文本配置
    private Map<String, String> getLocalizedTexts(String loc) {
        Map<String, String> texts = new HashMap<>();
        switch (loc) {
            case "en":
                texts.put("bluetooth_title", "Bluetooth");
                texts.put("enable_bluetooth_message", "Bluetooth needs to be enabled to scan for devices. Enable it now?");
                texts.put("location_service_title", "Location Service");
                texts.put("enable_location_message", "Location service must be enabled when scanning for Bluetooth devices. Please go to system settings to enable location service, then return to the app to continue.");
                texts.put("permission_request_title", "Permission Request");
                texts.put("bluetooth_permission_message", "To scan for nearby Bluetooth devices, we need access to your location (for Bluetooth scanning only). We will not use your location data for any other purpose.");
                texts.put("confirm", "Confirm");
                texts.put("cancel", "Cancel");
                texts.put("go_to_settings", "Go to Settings");
                break;
            case "ru":
                texts.put("bluetooth_title", "Bluetooth");
                texts.put("enable_bluetooth_message", "Необходимо включить Bluetooth для сканирования устройств. Включить сейчас?");
                texts.put("location_service_title", "Служба геолокации");
                texts.put("enable_location_message", "При сканировании устройств Bluetooth необходимо включить службу геолокации. Перейдите в настройки системы, включите геолокацию и вернитесь в приложение для продолжения.");
                texts.put("permission_request_title", "Запрос разрешений");
                texts.put("bluetooth_permission_message", "Чтобы сканировать ближайшие устройства Bluetooth, необходимо разрешение на доступ к вашей геолокации (только для сканирования Bluetooth). Мы не используем данные о вашем местоположении для других целей.");
                texts.put("confirm", "Подтвердить");
                texts.put("cancel", "Отмена");
                texts.put("go_to_settings", "Перейти в настройки");
                break;
            default: // 默认中文
                texts.put("bluetooth_title", "蓝牙");
                texts.put("enable_bluetooth_message", "需要开启蓝牙以扫描设备，是否现在开启？");
                texts.put("location_service_title", "位置服务");
                texts.put("enable_location_message", "扫描蓝牙设备时必须启用位置服务。请前往系统设置开启位置服务，然后返回应用继续操作。");
                texts.put("permission_request_title", "权限申请");
                texts.put("bluetooth_permission_message", "为了扫描附近的蓝牙设备，我们需要访问您的位置信息（仅限蓝牙扫描使用）。我们不会将您的位置数据用于其他目的。");
                texts.put("confirm", "确认");
                texts.put("cancel", "取消");
                texts.put("go_to_settings", "前往");
        }
        return texts;
    }


















    //等待窗口
    public void showWaitList(){
        dialogLoading = new RobotProgressDialog(mActivity);
        dialogLoading.setProgressStyle(ProgressDialog.STYLE_SPINNER);
        dialogLoading.setMessage("寻找设备.请稍等…");
        dialogLoading.setIndeterminate(true);
        dialogLoading.setCanceledOnTouchOutside(false);
        dialogLoading.show();

    }

    //展示设备列表窗口
    public void showDeviceList(){
        builder = new AlertDialog.Builder(mActivity);

        //builder.setIcon(R.mipmap.ic_icon_fish);

        builder.setTitle("选择设备");//选择设备

        String[] arrNames = new String[JavaScriptDirectInterface.bleScanFilters.size()];
        int index = 0;
        for (BluetoothDevice device : JavaScriptDirectInterface.bleScanFilters) {
            arrNames[index] = device.getName()+"-"+device.getAddress();

            index++;
        }

        builder.setItems(arrNames, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int item) {

                //StopSearching();

                already_clicked = true;

                try {
                    bluetoothGatt=connectBlueTooth(JavaScriptDirectInterface.bleScanFilters.get(item),false,mBluetoothGattCallback);

                } catch (Throwable e) {
                    Log.d("------error------", "2222222");
                }
            }

        });

        builder.setCancelable(true);

        item_dialog_instance = builder.create();

        //
       /* WindowManager.LayoutParams p = item_dialog_instance.getWindow().getAttributes();
        p.width = (int) (Width*0.5);
        p.height = (int) (Height*0.5);
        item_dialog_instance.getWindow().setAttributes(p);*/


        item_dialog_instance.show();


    }



    public void go() {
        MyDialog myDialog;
        Log.d("send", "_______________show______________");
        myDialog=new MyDialog(mActivity,R.style.MyDialog);
        myDialog.setTitle("警告！");
        myDialog.setMessage("警告：您的手机3秒钟内自爆");
        myDialog.setYesOnclickListener("确定", new MyDialog.onYesOnclickListener() {
            @Override
            public void onYesOnclick() {
                //Toast.makeText(getApplicationContext(),"拜拜，我们来生见",Toast.LENGTH_LONG).show();
                ///myDialog.dismiss();
            }
        });
        myDialog.setNoOnclickListener("取消", new MyDialog.onNoOnclickListener() {
            @Override
            public void onNoClick() {
                //Toast.makeText(getApplicationContext(),"明智的选择",Toast.LENGTH_LONG).show();
                //myDialog.dismiss();
            }
        });
        myDialog.show();

    }

    public void go1() {
        DialogItemAdapter adapter = new DialogItemAdapter(mActivity, iniDatas());

        AlertDialog alertDialog = new AlertDialog
                .Builder(mActivity)
                .setTitle("警告！11")
                .setSingleChoiceItems(adapter, 0, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                    }
                }).create();
        alertDialog.show();

    }

    public List<String> iniDatas() {
        List<String> list = new ArrayList<String>();

        list.add("科目1");
        list.add("科目二");
        list.add("科目三");
        list.add("科目1");
        list.add("科目二");
        list.add("科目三");
        list.add("科目1");
        list.add("科目二");
        list.add("科目三");

        return list;
    }

    public void go2() {
        mActivity.go2("1");
        /*AlertDialog a = new AlertDialog.Builder(mActivity).create();
        a.setTitle("选择设备");

        WindowManager.LayoutParams p = a.getWindow().getAttributes();
        p.width = (int) (Width*2);
        p.height = (int) (Height*2);
        a.getWindow().setAttributes(p);
        a.setCanceledOnTouchOutside(false);
        a.show();*/
    }
    public void StopSearching(){
        /*mActivity.unregisterReceiver(bt.discoverDevicesReceiver);
        mActivity.unregisterReceiver(bt.discoveryFinishedReceiver);
        dialogLoading.cancel();

        bt.bluetoothAdapter.cancelDiscovery();*/
        isSeraching = false;

        Log.d("------stop------", "11111111111111111111111111");
    }


}



















