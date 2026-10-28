package org.icqbot.android;


import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.ScanCallback;
import android.os.Build;
import android.support.annotation.RequiresApi;


@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
public class BleScanCallback extends ScanCallback{


    /*public void onScanResult(int callbackType, ScanResult result) {

        //添加
        BluetoothDevice device = result.getDevice();
        if (device.getName() != null && isAdd(device.getAddress()) ) {//判断设备是否添加过并且名称不为空
            Log.d("------ble------", device.getAddress());
            JavaScriptDirectInterface.bleScanFilters.add(device);

        }

        super.onScanResult(callbackType, result);
    }*/

    //判断设备是否添加
    private boolean isAdd( String Address) {
        for (BluetoothDevice current : JavaScriptDirectInterface.bleScanFilters) {
            if (Address.equals(current.getAddress())){

                return false;
            }
        }
        return true;
    }



}
