package org.icqbot.android;

/**
 * Created by yarila on 09.08.17.
 */


import java.io.*;
import java.util.ArrayList;

import android.app.*;
import android.bluetooth.*;
import android.content.*;
import android.support.annotation.NonNull;
import android.util.*;
import android.view.KeyEvent;
import android.widget.ArrayAdapter;
import android.widget.ListView;


public class BluetoothDevices {


    public final static String UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";

    private volatile AlertDialog.Builder builder;
    public volatile RobotProgressDialog dialogLoading;

    public final ArrayList<BluetoothDevice> ListDiscoveredDevices = new ArrayList<BluetoothDevice>();


    private  AlertDialog alertDialog;

    private  AlertDialog  item_dialog_instance;

    public  boolean isSeraching = false;

    private boolean isComConnected = false;//是Com连接

    protected  BluetoothThings bt;
    private boolean already_clicked = false;

    private Activity _activity;
    public BluetoothDevices( final Activity activity,BluetoothThings _bt){
        this.bt = _bt;
        this.already_clicked = false;

        this._activity = activity;

        Log.i("11111111111111111", "121212121212");
        bt.discoveryFinishedReceiver = new BroadcastReceiver(){//发现完成接收
            @Override
            public void onReceive(Context context, Intent intent) {

                Log.i("33333333333", "121212121212");
                String action = intent.getAction();

                if(BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {

                   // dialogLoading.dismiss();

                   // isSeraching = false;

                   //  activity.unregisterReceiver(bt.discoveryFinishedReceiver);

                    BluetoothDevices.this.StopSearching();


                    synchronized (BluetoothDevices.this){
                          if (ListDiscoveredDevices.size() == 0) {


                                BluetoothDevices.this.CloseAllDialogs();
                                alertDialog = new AlertDialog.Builder(activity).create();
                                alertDialog.setTitle("Alert");
                                alertDialog.setMessage("No device found");
                                alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
                                    new DialogInterface.OnClickListener() {
                                        public void onClick(DialogInterface dialog, int which) {
                                            dialog.dismiss();
                                        }
                                    });
                            alertDialog.show();

                        } else {
                            ttt(activity);
                        }
                  }

                }
            }
        };


        bt.discoverDevicesReceiver = new BroadcastReceiver(){//发现设备接收器
            @Override
            public void onReceive(Context context, Intent intent){
                String action = intent.getAction();
                Log.i("22222222222222222", "121212121212");
                if(BluetoothDevice.ACTION_FOUND.equals(action)) {

                    synchronized (BluetoothDevices.this){

                                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);

                                if (!ListDiscoveredDevices.contains(device)) {

                                    if (device.getName() != null) {

//                                        if (device.getName().startsWith("RNBT") || device.getName().startsWith("SQ") || device.getName().startsWith("ROB") || device.getName().startsWith("Scratch")) {
                                            Log.i("[Bluetooth_device1]", device.getName());
                                            ListDiscoveredDevices.add(device);
                                            ttt(activity);
//                                        }
                                }
                                }
                   }
                }
            }
        };

       // activity.registerReceiver(bt.discoverDevicesReceiver, new IntentFilter(BluetoothDevice.ACTION_FOUND));
       // activity.registerReceiver(bt.discoveryFinishedReceiver, new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_FINISHED));

    }

    private void ttt(final Context activity) {
// Already started 已经开始


        Log.i("[Bluetooth_device]", "ttt()");
//
       // if (!already_clicked) {

            if (bt.socket != null) {
                return;
            }

            Log.i("[Bluetooth_device]", "begin_process_device()");

            dialogLoading.dismiss();

            if (builder != null) {

                String[] arrNames = new String[ListDiscoveredDevices.size()];
                int index = 0;
                for (BluetoothDevice device : ListDiscoveredDevices) {
                    arrNames[index] = device.getName();
                    index++;
                }

                ListView list = item_dialog_instance.getListView();
                ArrayAdapter adapter = (ArrayAdapter) list.getAdapter();
                adapter.notifyDataSetChanged();

                item_dialog_instance.show();


            } else {


                builder = new AlertDialog.Builder(activity);
                builder.setTitle("Select device");//选择设备

                String[] arrNames = new String[ListDiscoveredDevices.size()];
                int index = 0;
                for (BluetoothDevice device : ListDiscoveredDevices) {
                    arrNames[index] = device.getName();
                    index++;
                }

                builder.setItems(arrNames, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int item) {

                       // activity.unregisterReceiver(bt.discoverDevicesReceiver);
                       // bt.bluetoothAdapter.cancelDiscovery();

                        BluetoothDevices.this.StopSearching();

                        already_clicked = true;

                        try {
                            bt.socket = ListDiscoveredDevices.get(item).createRfcommSocketToServiceRecord(java.util.UUID.fromString(UUID));
                            bt.socket.connect();
                        } catch (Throwable e) {
                            try {
                                bt.socket = (BluetoothSocket) ListDiscoveredDevices.get(item).getClass()
                                        .getMethod("createRfcommSocket", new Class[]{int.class})
                                        .invoke(ListDiscoveredDevices.get(item), 1);
                                bt.socket.connect();
                            } catch (Exception e1) {
                            }
                        }

                        bt.reader = bt.new Reader();
                        bt.reader.start();
                    }
                });



                builder.setCancelable(true);

                item_dialog_instance = builder.create();

                item_dialog_instance.setOnKeyListener(new DialogInterface.OnKeyListener(){

                    @Override
                    public boolean onKey(DialogInterface dialog, int keyCode, @NonNull KeyEvent event){

                        if (event.getAction() == KeyEvent.ACTION_DOWN) {
                            switch (keyCode) {
                                case KeyEvent.KEYCODE_BACK:


                                    if (BluetoothDevices.this.isSeraching) {

                                        BluetoothDevices.this.StopSearching();
                                        dialog.dismiss();


                                    }else{

                                        dialog.dismiss();

                                    }
                            }
                        }

                        return true;
                    }


                });

                item_dialog_instance.show();
               // item_dialog_instance.onBackPressed();

            }



    }


   public void CloseAllDialogs(){


       if (alertDialog != null) alertDialog.cancel();


   }

   public void StopSearching(){

       _activity.unregisterReceiver(bt.discoverDevicesReceiver);
       _activity.unregisterReceiver(bt.discoveryFinishedReceiver);
       dialogLoading.cancel();


       bt.bluetoothAdapter.cancelDiscovery();
       isSeraching = false;

       synchronized (ListDiscoveredDevices) {
      //     ListDiscoveredDevices.clear();
       }


   }



    public void btService(final Context activity){

        Log.i("[Bluetooth_device]", "locateDevices()");

        ListDiscoveredDevices.clear();

        if(bt.socket != null){
            try{
                bt.socket.close();
            }
            catch (IOException e){
            }
        }

        bt.socket = null;

        if(bt.bluetoothAdapter == null || !bt.bluetoothAdapter.isEnabled()){
            AlertDialog alertDialog = new AlertDialog.Builder(activity).create();
            alertDialog.setTitle("注意");
            alertDialog.setMessage("蓝牙已被禁用.");
            alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
                    new DialogInterface.OnClickListener(){
                        public void onClick(DialogInterface dialog, int which){
                            dialog.dismiss();
                        }
                    });
            alertDialog.show();
            /*Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent,1);*/
        }
        else{
            activity.registerReceiver(bt.discoverDevicesReceiver, new IntentFilter(BluetoothDevice.ACTION_FOUND));
            activity.registerReceiver(bt.discoveryFinishedReceiver, new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_FINISHED));


            bt.bluetoothAdapter.cancelDiscovery();
            bt.bluetoothAdapter.startDiscovery();


            isSeraching = true;


            dialogLoading = new RobotProgressDialog(activity);
            dialogLoading.setProgressStyle(ProgressDialog.STYLE_SPINNER);
            dialogLoading.setMessage("寻找设备.请稍等…");
            dialogLoading.setIndeterminate(true);
            dialogLoading.setCanceledOnTouchOutside(false);
            dialogLoading.show();
        }
    }




}




