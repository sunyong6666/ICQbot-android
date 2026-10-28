//////////////////////////////////////
//  General UI Layout  总体界面布局
/////////////////////////////////////

import ScratchJr from '../ScratchJr';
import BlockSpecs from '../blocks/BlockSpecs';
import Alert from './Alert';
import Project from './Project';
import Thumbs from './Thumbs';
import Palette from './Palette';
import Grid from './Grid';
import Stage from '../engine/Stage';
import ScriptsPane from './ScriptsPane';
import Undo from './Undo';
import Library from './Library';
import iOS from '../../iPad/iOS';
import IO from '../../iPad/IO';
import MediaLib from '../../iPad/MediaLib';
import Paint from '../../painteditor/Paint';
import Events from '../../utils/Events';
import Localization from '../../utils/Localization';
import ScratchAudio from '../../utils/ScratchAudio';
import Cookie from '../../utils/Cookie';
import Camera from '../../painteditor/Camera';
import {frame, gn, CSSTransition, localx, newHTML, scaleMultiplier, getIdFor, isTablet, newDiv,
    newTextInput, isAndroid, getDocumentWidth, getDocumentHeight, setProps, globalx} from '../../utils/lib';


let projectNameTextInput = null;
let info = null;
let okclicky = null;
let robot_panel = null;
let robot_okclicky = null;
let infoBoxOpen = false;
var robot_search;//蓝牙按钮

window.scing=false;//是否正在刷新蓝牙列表   
window.aaa=[];//蓝牙列表
window.connName="";//当前连接蓝牙名称   

window.rssi_type="";//判断定位连接使用

window.clock=0;//点击次数

var set_ble_zd = Cookie.get('ble_zd');
if(set_ble_zd=="" || set_ble_zd==null){
    set_ble_zd="F";//默认关闭
}
/*alert(localStorage.getItem('ble_zd'))*/
console.log(set_ble_zd)

if (isAndroid){
    AndroidInterface.getBLEstate();//获取当前连接蓝牙名称
  }
window.t5 = null;
window.tf_uname=null;//
var refresh=null// 关闭刷新蓝牙列表



export default class UI {//主界面
    static get infoBoxOpen () {
        return infoBoxOpen;
    }
    
    static BTclose(){
        var isOff = ScratchJr.runtime.inactive();
        if(!isOff){
            ScratchJr.stopStrips();
            userStart = false;
        }
    }
    //连接成功
    static connSu(){
        setTimeout(function() {//延时关闭，给硬件时间
            document.getElementById("connBG").style.display='none';
        }, 1000);

    }
    static showVersion(v){
        document.getElementById("ICvsion").innerHTML = Localization.localize('FirmwareV')+":"+v;
    }
    static show_recordSound(){
        Palette.show_recordSound();
    }
    static show_setMode(){
        Camera.show_setMode();
    }
    


    static layout () {
        /*蓝牙连接遮照层*/
        var connBG = newHTML('div', 'connBG', frame);
        connBG.setAttribute('id', 'connBG');

        var connBG_t = newHTML('div', 'connBG_t', connBG);
        connBG_t.setAttribute('id', 'connBG_t');
        connBG_t.textContent = Localization.localize('BLE_CONNING');

        var close_connBG = newHTML('div', 'close_connBG', connBG);
        close_connBG.setAttribute('id', 'close_connBG');
        close_connBG.textContent='X';
        document.getElementById("close_connBG").onclick=function(){
            document.getElementById("connBG").style.display='none';
            //AndroidInterface.disconnect_type();//清除蓝牙状态
        }




        /*蓝牙列表--浦东第一帅*/
        var div = newHTML('div', 'blue_list', frame);
        div.setAttribute('id', 'blue_list');
        //关闭按钮
        var closeBtn = newHTML('button', 'btn_close', div);
        closeBtn.setAttribute('id', 'btn_close');

        //定位连接启停按钮
        var img_dis_ble = newHTML('div', 'img_dis_ble', div);
        var switch_box = newHTML('label', 'switch', div);
        switch_box.setAttribute('id', 'switch_box');
        
        var checkbox = newHTML('input', 'checkbox', switch_box);
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', 'checkbox');
        if(set_ble_zd=="T"){
            checkbox.checked=true;
        }
        var slider_round = newHTML('span', 'slider round', switch_box);
        checkbox.addEventListener("change", function() {
            if (set_ble_zd=="T") {
                set_ble_zd="F";
            } else {
                set_ble_zd="T";
            }
            AndroidInterface.setBleZD(set_ble_zd);//设置自动连接
            Cookie.set('ble_zd', set_ble_zd);
        });

        
        document.getElementById("btn_close").onclick=function(){
            document.getElementById("blue_list").style.display="none";
            AndroidInterface.stopDeviceSearch();//停止扫描
            
            //关闭刷新蓝牙列表
            window.setTimeout(function(){
                window.clearInterval(refresh);
            },50);
        }

        //设备列表
        var blue_l = newHTML('button', 'blue_l', div);
        blue_l.setAttribute('id', 'blue_l');
        //blue_l.textContent="X123123213213213";
        document.getElementById("blue_l").onclick=function(){
            var text=event.target.id;
            var name=event.target.innerHTML;

            if (text=="blue_l"){
                return;
            }
            if(connName!=""){
                AndroidInterface.disconnect();//断开蓝牙
            }

            /*window.setTimeout(function(){
                window.clearInterval(t2);
            },1000);*/
            AndroidInterface.connectBluetooth(text,name);//连接蓝牙
            document.getElementById("connBG").style.display='block';

            //直接消失界面

            document.getElementById("blue_list").style.display="none";
            //关闭刷新蓝牙列表
            window.setTimeout(function(){
                window.clearInterval(refresh);
            },50);

            /*var t2=setInterval(function(){// 判断是否连接成功
                if(connName==name){//成功
                    document.getElementById("blue_list").style.display="none";
                    //关闭刷新蓝牙列表
                    window.setTimeout(function(){
                        window.clearInterval(refresh);
                    },50);
                }
            
            },50);

            window.setTimeout(function(){
                window.clearInterval(t2);
            },1000);*/
        }

        //刷新按钮
        var blue_upd = newHTML('button', 'blue_upd', div);
        blue_upd.setAttribute('id', 'blue_upd');
        //blue_upd.textContent=Localization.localize('BLE_REFRESH');
        document.getElementById("blue_upd").onclick=function(){
            UI.StartDeviceSearch();
        }

        //断开按钮
        var blue_dis = newHTML('button', 'blue_dis', div);
        blue_dis.setAttribute('id', 'blue_dis');
        //blue_dis.textContent=Localization.localize('BLE_DIS');
        document.getElementById("blue_dis").onclick=function(){
            AndroidInterface.disconnect();//断开蓝牙
            /*window.setTimeout(function(){
                UI.StartDeviceSearch();
            },500);*/
            
        }





        /*控制台--浦东第一帅*/
        var div_console = newHTML('div', 'div_console', frame);
        div_console.setAttribute('id', 'div_console');
        //关闭按钮
        var closeBtn_console = newHTML('button', 'btn_close_console', div_console);
        closeBtn_console.setAttribute('id', 'btn_close_console');
        //closeBtn_console.textContent="X";
        document.getElementById("btn_close_console").onclick=function(){
            document.getElementById("div_console").style.display="none";
            window.setTimeout(function(){
                window.clearInterval(t5);
            },100);
        }
        /*//输出框
        var output = newHTML('textarea', 'output', div_console);
        output.setAttribute('id', 'output');
        output.rows="10";
        output.cols="0";


        //清除按钮
        var output_close = newHTML('button', 'output_close', div_console);
        output_close.setAttribute('id', 'output_close');
        output_close.textContent=Localization.localize('PUT_CLEAR');*/
        
        //端口1
        var output1 = newHTML('div', 'output1', div_console);
        output1.setAttribute('id', 'output1');

        //端口2
        var output2 = newHTML('div', 'output2', div_console);
        output2.setAttribute('id', 'output2');

        //端口3
        var output3 = newHTML('div', 'output3', div_console);
        output3.setAttribute('id', 'output3');

        //端口4
        var output4 = newHTML('div', 'output4', div_console);
        output4.setAttribute('id', 'output4');

        //版本号
        var  ICvsion = newHTML('div', 'ICvsion', div_console);
        ICvsion.setAttribute('id', 'ICvsion');




        /*蓝牙改名界面--浦东第一帅*/
        var div_upName = newHTML('div', 'div_upName', frame);
        div_upName.setAttribute('id', 'div_upName');
        //关闭按钮
        var closeBtn_upName = newHTML('button', 'btn_close_upName', div_upName);
        closeBtn_upName.setAttribute('id', 'btn_close_upName');
        document.getElementById("btn_close_upName").onclick=function(){
            document.getElementById("div_upName").style.display="none";
        }
        //名称
        var new_name = newHTML('input', 'new_name', div_upName);
        new_name.setAttribute('id', 'new_name');
        //确定按钮
        var true_name = newHTML('button', 'true_name', div_upName);
        true_name.setAttribute('id', 'true_name');
        document.getElementById("true_name").onclick=function(){
            var name=new_name.value;
            if(name.length>6){
                alert("名称要小于6个字符");
            }else if(name.length==""){
                alert("名称不能为空");
            }else if(UI.isEmoji(name)){
                alert("名称中不能包含表情符");
            }else{
                
                tf_uname=setInterval(function(){// 检测是否断开
                    if(window.connName==""){
                            window.clearInterval(tf_uname);
                            window.clearInterval(tf_uname);
                            //alert("改名成功");
                            document.getElementById("div_upName").style.display="none";
                            window.clearInterval(tf_uname);
                            window.clearInterval(tf_uname);
                            window.clearInterval(tf_uname);
                    }
        
                 },100);
                AndroidInterface.upname(name);//修改名称
                window.clearInterval(tf_uname);
                document.getElementById("div_upName").style.display="none";

            }
            
        }



        UI.topSection();
        UI.middleSection();//中间部分
        UI.BottomSection();//底部截面
        UI.fullscreenControls();//全屏控制
        UI.createFormForText(frame);//为文本创建表单
        ScratchJr.setupKeypad();
        ScratchJr.setupEditableField();
        UI.aspectRatioAdjustment();


         /*蓝牙名称--浦东第一帅*/
        var name_b = newHTML('div', 'conn_name', robot_search);
        name_b.setAttribute('id', 'conn_name');
        setInterval(function(){
                name_b.textContent=connName;
                if(connName!=''){
                    robot_search.setAttribute("style","background:url(\'assets/ui/BTbutton1.svg\');");
                }else{
                    robot_search.setAttribute("style","background:url(\'assets/ui/BTbutton.svg\');");
                    
                    //初始化传感器数据
                    window.tilt_data=["",""];//倾斜传感器读取到的数值  端口--值

                    window.light_data1=["",""];//光电1读取到的数值  端口--值
                    window.light_data2=["",""];//光电2读取到的数值  端口--值

                    window.button_data1=["",""];//按钮1读取到的数值  端口--值
                    window.button_data2=["",""];//按钮2读取到的数值  端口--值

                    window.voice_data=["",""];//语音读取到的数值  端口--值

                    window.port1="";//端口1
                    window.port2="";//端口2
                    /*var isOff = ScratchJr.runtime.inactive();
                    if(!isOff){
                        ScratchJr.stopStrips();
                        userStart = false;
                    }*/
                }
                
        },100);


    }

        /*if (isOff) {//开始
            ScratchJr.runStrips(e);
        } else {//结束
            AndroidInterface.sendData("INIT",0);
            //Robot.motor_stopP();
            ScratchJr.stopStripsFromTop(e);
        }*/
    // Helps debug on Android 4.2 by enabling the user to type in a
    // JavaScript expression and evaluate the output and render to console.log.
    /*static addDebugControl () {
        var div = newHTML('div', 'debug', document.body);
        setProps(div.style, {
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '64px',
            height: '64px',
            background: 'red',
            zIndex: 30000
        });
        div.ontouchstart = function (e) {
            console.log(eval(prompt('Enter Debug JavaScript')));
        };
    }*/

    /** Tweak some elements depending on aspect ratio */
    static aspectRatioAdjustment () {
        var aspect = getDocumentWidth() / getDocumentHeight();
        if (aspect > 1.45) {
            // Nudge sprite list right a bit and the pages list left a bit
            gn('library').style.left = '3vw';
            gn('pages').style.right = '1vw';
        }
    }

    static topSection () {
        var div = newHTML('div', 'topsection', frame);
        div.setAttribute('id', 'topsection');
        if (ScratchJr.isEditable()) {
            UI.addProjectInfo();
        }
        UI.leftPanel(div);
        UI.stageArea(div);
        UI.rightPanel(div);

    //    UI.addRobotPanel();
    }

    static leftPanel (div) {
        // sprite library
        var sl = newHTML('div', 'leftpanel', div);
        var flip = newHTML('div', 'flipme', sl);
        flip.setAttribute('id', 'flip');

        flip.onclick = function (evt) {
            ScratchJr.saveAndFlip(evt);
        }; 

        //蓝牙
        robot_search = newHTML('div', 'robot_search1', sl);
        robot_search.setAttribute('id', 'robot_search1');
        robot_search.onclick = function () {
            UI.StartDeviceSearch();
        }; 

        
        UI.layoutLibrary(sl);
    }

    static middleSection () {
        var bp = newHTML('div', 'blockspalette', frame);
        bp.setAttribute('id', 'blockspalette');
        Palette.setup(bp);//调色板
        Undo.setup(bp);//撤销
    }

    static BottomSection () {
        ScriptsPane.createScripts(frame);
    }

    static addRobotPanel(){

           robot_panel = newHTML('div', 'robot_panel', frame);
           robot_panel.setAttribute('id', 'robot_panel');
           var robot_info = newHTML('div', 'infobox fade', frame);
           robot_info.setAttribute('id', 'robot_info');

           robot_okclicky = newHTML('div', 'paintdone', robot_info);
           newHTML('div', 'infoboxlogo', robot_info);

           

           robot_panel.ontouchend = UI.showRobotInfo;
           //AZ
           robot_panel.onmousedown = UI.showRobotInfo;

           robot_okclicky.ontouchstart = UI.hideRobotInfo;
           robot_okclicky.ontouchstart = function (evt) {
           UI.hideRobotInfo(evt);
           };
           robot_okclicky.onmousedown = function (evt) {
           UI.hideRobotInfo(evt);
           };

          


 }


static showRobotSearchingState(){

  if (isAndroid){
    AndroidInterface.showRobotSearchingState();
  }

}

//扫描蓝牙 
 static StartDeviceSearch(){
    if (isAndroid){
        var loc = Cookie.get('localization') || 'zh'; ;
        AndroidInterface.startDeviceSearch(set_ble_zd,loc);
        document.getElementById("blue_list").style.display="block";
        if(!scing){
            aaa=[];
        }
        refresh=setInterval(function(){// 显示设备列表   
            document.getElementById("blue_l").innerHTML = "";
            // 遍历deviceList
            for(var i=0; i<aaa.length; i++){
                var msgDiv = document.createElement("div");
                var s = aaa[i];
                msgDiv.textContent = s.substring(0,s.indexOf("*"));
                msgDiv.setAttribute('id', s.substring(s.indexOf("*")+1));

                //msgDiv.dataset.deviceId = s.substring(s.indexOf("*")+1);
                msgDiv.setAttribute("style","background-color: #fff7e9;color: #4597dd;text-align:center;padding: 10px 0;margin:10px 0;border-radius:10px;font-size:3vh;");//height:20%;


                document.getElementById("blue_l").appendChild(msgDiv);
            }
        },50);

        //定位连接使用
        var rssi_con=setInterval(function(){// 判断是否rssi连接
            if(rssi_type=="t"){//rssi连接
                document.getElementById("blue_list").style.display="none";
                //关闭刷新蓝牙列表
                window.setTimeout(function(){
                    window.clearInterval(refresh);
                },50);
            }
        
        },50);

        window.setTimeout(function(){
            window.clearInterval(rssi_con);
            rssi_type="";
        },6000);




        
     }

 }
 //打开蓝牙改名界面
 static bleUpName(){
    clock+=1;
    if(clock==1){
        window.setTimeout(function(){
            window.clock=0;
        },10000);
    }
    

    if(clock>=10){
        window.clock=0;
        if(window.connName==""){
            UI.StartDeviceSearch();//未连接蓝牙打开蓝牙连接按钮
            return;
        }
        new_name.value="";//清空输入
        document.getElementById("div_upName").style.display="block";//界面弹出
    }
 }

static isEmoji(substring) {
    for ( var i = 0; i < substring.length; i++) {
        var hs = substring.charCodeAt(i);
        if (0xd800 <= hs && hs <= 0xdbff) {
            if (substring.length > 1) {
                var ls = substring.charCodeAt(i + 1);
                var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
                if (0x1d000 <= uc && uc <= 0x1f77f) {
                    return true;
                }
            }
        } else if (substring.length > 1) {
            var ls = substring.charCodeAt(i + 1);
            if (ls == 0x20e3) {
                return true;
            }
        } else {
            if (0x2100 <= hs && hs <= 0x27ff) {
                return true;
            } else if (0x2B05 <= hs && hs <= 0x2b07) {
                return true;
            } else if (0x2934 <= hs && hs <= 0x2935) {
                return true;
            } else if (0x3297 <= hs && hs <= 0x3299) {
                return true;
            } else if (hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030
                    || hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b
                    || hs == 0x2b50) {
                return true;
            }
        }
    }
}









 //打开控制台
 static RobotConsole(){
    if(window.connName!=""){
        AndroidInterface.queryVersion();
    }else{
        document.getElementById("ICvsion").innerHTML = '';
    }
    document.getElementById("div_console").style.display="block";

    t5=setInterval(function(){// 更新控制台信息
        //按钮1
        if(button_data1[1]=="00"){
            document.getElementById("output3").innerHTML = Localization.localize('BUTTON1')+":&emsp;&emsp;&emsp;&emsp;"+Localization.localize('DOWN');
        }else{
            document.getElementById("output3").innerHTML = Localization.localize('BUTTON1')+":&emsp;&emsp;&emsp;&emsp;"+Localization.localize('UP');
        }
        //按钮2
        if(button_data2[1]=="00"){
            document.getElementById("output4").innerHTML = Localization.localize('BUTTON2')+":&emsp;&emsp;&emsp;&emsp;"+Localization.localize('DOWN');
        }else{
            document.getElementById("output4").innerHTML = Localization.localize('BUTTON2')+":&emsp;&emsp;&emsp;&emsp;"+Localization.localize('UP');
        }

        //端口1
        if(port1=="01"){//光电
            document.getElementById("output1").innerHTML = Localization.localize('PORT1')+":&emsp;"+Localization.localize('PHOTOELECTRIC_SENSOR')+"&emsp;"+light_data1[1];
        }else if(port1=="02"){//倾斜
            document.getElementById("output1").innerHTML = Localization.localize('PORT1')+":&emsp;"+Localization.localize('TILT_SENSOR')+"&emsp;"+UI.choice_tilt(tilt_data[1]);
        }else if(port1=="04"){//语音
            document.getElementById("output1").innerHTML = Localization.localize('PORT1')+":&emsp;"+Localization.localize('SPEECH_SENSOR')+"&emsp;"+UI.choice_speech(voice_data[1]);
        }else{
            document.getElementById("output1").innerHTML = Localization.localize('PORT1')+":&emsp;&emsp;&emsp;&emsp;"+Localization.localize('NULL');
        }

         //端口2
        if(port2=="01"){//光电
            document.getElementById("output2").innerHTML = Localization.localize('PORT2')+":&emsp;"+Localization.localize('PHOTOELECTRIC_SENSOR')+"&emsp;"+light_data2[1];
        }else if(port2=="02"){//倾斜
            document.getElementById("output2").innerHTML = Localization.localize('PORT2')+":&emsp;"+Localization.localize('TILT_SENSOR')+"&emsp;"+UI.choice_tilt(tilt_data[1]);
        }else if(port2=="04"){//语音
            /*if(voice_data[1]=="00"){
                return
            }*/
            document.getElementById("output2").innerHTML = Localization.localize('PORT2')+":&emsp;"+Localization.localize('SPEECH_SENSOR')+"&emsp;"+UI.choice_speech(voice_data[1]);
        }else{
            document.getElementById("output2").innerHTML = Localization.localize('PORT2')+":&emsp;&emsp;&emsp;&emsp;"+Localization.localize('NULL');
        }
        //console.log("1");
        
    },100);


 }
 
//分辨倾斜类型
 static choice_tilt(a){
    if(a=="00"){
        return Localization.localize('TILT_LEVEL');
    }else if(a=="01"){
        return Localization.localize('TILT_FORWARD');
    }else if(a=="02"){
        return Localization.localize('TILT_BACKWARD');
    }else if(a=="03"){
        return Localization.localize('TILT_LEFT');
    }else if(a=="04"){
        return Localization.localize('TILT_RIGHT');
    }else if(a=="05"){
        return Localization.localize('TILT_LEFT_ROTATION');
    }else if(a=="06"){
        return Localization.localize('TILT_RIGHT_ROTATION');
    }else if(a=="08"){
        return Localization.localize('TILT_SHAKE');
    }else if(a=="09"){
        return Localization.localize('TILT_SHAKE');//TILT_VIOLENT_SHAKING
    }
 }
//分辨语音类型
 static choice_speech(a){
    if(a=="31"){
        return Localization.localize('SELF-LEARNING_COMMAND1');
    }else if(a=="32"){
        return Localization.localize('SELF-LEARNING_COMMAND2');
    }else if(a=="33"){
        return Localization.localize('SELF-LEARNING_COMMAND3');
    }else if(a=="34"){
        return Localization.localize('SELF-LEARNING_COMMAND4');
    }else if(a=="27"){
        return Localization.localize('SELF-LEARNING_COMMAND5');
    }else if(a=="28"){
        return Localization.localize('SELF-LEARNING_COMMAND6');
    }
    else if(a=="1F"){
        return Localization.localize('VORICE-RIGHT');
    }else if(a=="1E"){
        return Localization.localize('VORICE-LEFT');
    }else if(a=="20"){
        return Localization.localize('VORICE-UP');
    }else if(a=="21"){
        return Localization.localize('VORICE-DOWN');
    }else if(a=="04"){
        return Localization.localize('VORICE-RR');
    }else if(a=="03"){
        return Localization.localize('VORICE-LL');
    }else if(a=="24"){
        return Localization.localize('VORICE-JUMP');
    }else if(a=="25"){
        return Localization.localize('VORICE-GOHOME');
    }else if(a=="26"){
        return Localization.localize('VORICE-STOP');
    }

    return Localization.localize('VORICE-NULL')
 }
 

 static Disconnect(){
    if (isAndroid){
        AndroidInterface.disconnect();
        UI.StartDeviceSearch();
     }

 }

 static addDeviceToList(){

 }

//-------------ai相关----------------
//打开ai窗口
static showAIDialog() {
    if (window.AndroidInterface) {
        window.AndroidInterface.openAI();
    } else if (window.webkit && window.webkit.messageHandlers) {
        window.webkit.messageHandlers.openAI.postMessage("");
    } else {
        alert("不支持AI功能");
    }
}






  static SjrRead_Android(data){
    var contents = data.replace("data:;base64,", "");
    iOS.loadProjectFromSjr(contents);
  }


  static readFile(e){
     var file = e.target.files[0];
     if (!file) {
        return;
     }
     var reader = new FileReader();
     reader.onload = function(e){
        var contents = e.target.result.replace("data:;base64,", "");
        iOS.loadProjectFromSjr(contents);
     };
     reader.readAsDataURL(file);
  }

      static saveAndShare () {

              // Save the project's new name
              UI.handleTextFieldSave(true);

              // Save any changes made to the project 对项目进行任何更改
              //ScratchJr.onHold = true; // Freeze the editing UI
              ScratchJr.stopStripsFromTop(evt);


              Project.prepareToSave(ScratchJr.currentProject, function () {
                  Alert.close();

                  // Package the project as a .sjr file
                  IO.zipProject(ScratchJr.currentProject, function (contents) {
                      ScratchJr.onHold = false; // Unfreeze the editing UI


                  if (!isAndroid){
                      var pom = document.createElement('a');

                      pom.setAttribute('href', URL.createObjectURL(contents, {
                         type: "application/octet-stream"
                      }));
                      pom.setAttribute('download', IO.zipFileName + ".sjr");
                      pom.click();

                    }else{
                       AndroidInterface.SjrFileSave(IO.zipFileName + ".sjr",contents);
                    }
                      shareLoadingGif.style.visibility = 'hidden';
                  });
              });
          }

          static SjrFileChoose(){

            var oInputFile;

            if (isAndroid){
                  AndroidInterface.SjrFileChoose();

            }else{

             if (oInputFile == undefined){
            oInputFile = document.createElement("input");
            oInputFile.setAttribute('type', "file");
            oInputFile.style.position = "absolute";
            oInputFile.style.left = "0px";
            oInputFile.style.top = "0px";
            oInputFile.style.width = "1px";
            oInputFile.style.height = "1px";
            oInputFile.addEventListener('change', UI.readFile, false);
            document.body.appendChild(oInputFile);
          }
              setTimeout(function(){
                oInputFile.click();
                oInputFile.focus();
              }, 1000);

            }
          }


    static addProjectInfo () {

        info = newHTML('div', 'info', frame);
        info.setAttribute('id', 'projectinfo');
        var infobox = newHTML('div', 'infobox fade', frame);
        infobox.setAttribute('id', 'infobox');
        okclicky = newHTML('div', 'paintdone', infobox);
        newHTML('div', 'infoboxlogo', infobox);
        var nameField = UI.addEditableName(infobox);
        var staticinfo = newHTML('div', 'fixedinfo', infobox);
        var author = newHTML('div', 'infolabel', staticinfo);
        author.setAttribute('id', 'deviceName');


        



        function saveAndShare () {
            // Save the project's new name 保存项目的新名称
            UI.handleTextFieldSave(true);

            // Save any changes made to the project  保存对项目所做的任何更改
            ScratchJr.onHold = true; // Freeze the editing UI 冻结编辑UI
            
            console.log(3)
            Project.prepareToSave(ScratchJr.currentProject, function () {
                Alert.close();

                // Package the project as a .sjr file 将项目打包为.sjr文件
                IO.zipProject(ScratchJr.currentProject, function (contents) {
                    ScratchJr.onHold = false; // Unfreeze the editing UI 解冻编辑UI


                if (!isAndroid){
                    var pom = document.createElement('a');

                    pom.setAttribute('href', URL.createObjectURL(contents, {
                       type: "application/octet-stream"
                    }));
                    pom.setAttribute('download', IO.zipFileName + ".sjr");
                    pom.click();

                  }else{

                     AndroidInterface.SjrFileSave(IO.zipFileName + ".sjr",contents);

                  }

                    shareLoadingGif.style.visibility = 'hidden';
                });
            });
        }

        function readFile(e){
           var file = e.target.files[0];
           if (!file) {
              return;
           }
           var reader = new FileReader();
           reader.onload = function(e){
              var contents = e.target.result.replace("data:;base64,", "");
              iOS.loadProjectFromSjr(contents);
           };
           reader.readAsDataURL(file);
        }



        var   divButtonLoad;

        if (!isAndroid){
              var oInputFile = document.createElement("input");
               oInputFile.setAttribute('type', "file");
              //  oInputFile.setAttribute('display', "none");
              // oInputFile.setAttribute('class', "infoboxShareButton");


            oInputFile.style.position = "absolute";
            oInputFile.style.left = "0px";
            oInputFile.style.top = "0px";
            oInputFile.style.width = "1px";
            oInputFile.style.height = "1px";
            oInputFile.addEventListener('change', readFile, false);
            document.body.appendChild(oInputFile);

            /*divButtonLoad = newHTML('div', 'infoboxShareButton', divButtons);
            divButtonLoad.id = 'infoboxShareButtonEmail';
            divButtonLoad.textContent = Localization.localize('LOAD_FILE');*/

           }


             function SjrFileChoose(){

               if (isAndroid){
                     AndroidInterface.SjrFileChoose();
               }else{
                 setTimeout(function(){
                   oInputFile.click();
                   oInputFile.focus();
                 }, 1000);

               }


             }
        // divButtonLoad.onmousedown = divButtonLoad.ontouchstart;




        if (window.Settings.shareEnabled) {
            // Sharing 分享
            var shareButtons = newHTML('div', 'infoboxShareButtons', infobox);

            var shareEmail = newHTML('div', 'infoboxShareButton', shareButtons);
            shareEmail.id = 'infoboxShareButtonEmail';
            shareEmail.textContent = Localization.localize('SHARING_BY_EMAIL');

            if (isAndroid) {
                shareEmail.style.margin = 'auto';
            } else {
                shareEmail.style.float = 'left';
            }

            if (!isAndroid) {
                var shareAirdrop = newHTML('div', 'infoboxShareButton', shareButtons);
                shareAirdrop.id = 'infoboxShareButtonAirdrop';
                shareAirdrop.textContent = Localization.localize('SHARING_BY_AIRDROP');
                shareAirdrop.style.float = 'right';
                shareAirdrop.onclick = function (e) {
                    /*UI.parentalGate(e, function (e) {*/
                    //alert(1)
                        UI.infoDoShare(e, nameField, shareLoadingGif, 1);
                    /*});*/
                };

            }

            iOS.deviceName(function (name) {
                gn('deviceName').textContent = name;
            });

            var shareLoadingGif = newHTML('img', 'infoboxShareLoading', shareButtons);
            shareLoadingGif.src = './assets/ui/loader.png';

            shareEmail.onclick = function (e) {
                //UI.parentalGate(e, function (e) {
                //alert(3)
                    UI.infoDoShare(e, nameField, shareLoadingGif, 0);
                //});
            };

        }


        info.ontouchend = UI.showInfoBox;
//AZ
        info.onmousedown = UI.showInfoBox;

        okclicky.ontouchstart = UI.hideInfoBox;
        okclicky.ontouchstart = function (evt) {
            UI.hideInfoBox(evt, nameField);
        };
        okclicky.onmousedown = function (evt) {
            UI.hideInfoBox(evt, nameField);
        };
    }

    static parentalGate (evt, callback) {
        ScratchAudio.sndFX('tap.wav');
        var pgFrame = newHTML('div', 'parentalgate', gn('frame'));

        var pgCloseButton = newHTML('div', 'paintdone', pgFrame);
        pgCloseButton.ontouchstart = function () {
            parentalGateClose(false);
        };
        pgCloseButton.onmousedown = function () {
            parentalGateClose(false);
        };

        var pgProblem = newHTML('div', 'parentalgateproblem', pgFrame);
        var pgChoiceA = newHTML('div', 'parentalgatechoice', pgFrame);
        var pgChoiceB = newHTML('div', 'parentalgatechoice', pgFrame);
        var pgChoiceC = newHTML('div', 'parentalgatechoice', pgFrame);

        var problems = [
            // Problem, Choice A, Choice B, Choice C, Correct choice #
            ['30 + 7', '37', '9', '28', 0],
            ['22 + 3', '18', '25', '3', 1],
            ['91 + 1', '32', '74', '92', 2],
            ['30 + 4', '34', '59', '12', 0],
            ['48 + 1', '9', '49', '20', 1],
            ['32 + 6', '23', '99', '38', 2],
            ['53 + 4', '57', '12', '90', 0],
            ['26 + 3', '17', '29', '8', 1],
            ['71 + 1', '58', '14', '72', 2],
            ['11 + 8', '19', '23', '67', 0]
        ];

        var problemChoice = Math.floor(Math.random() * problems.length);
        var theProblem = problems[problemChoice];

        pgProblem.textContent = theProblem[0];
        pgChoiceA.textContent = theProblem[1];
        pgChoiceB.textContent = theProblem[2];
        pgChoiceC.textContent = theProblem[3];

        pgChoiceA.ontouchstart = function () {
            parentalGateClose(theProblem[4] == 0);
        };
        pgChoiceA.onmousedown = function () {
            parentalGateClose(theProblem[4] == 0);
        };
        pgChoiceB.ontouchstart = function () {
            parentalGateClose(theProblem[4] == 1);
        };
        pgChoiceB.onmousedown = function () {
            parentalGateClose(theProblem[4] == 1);
        };
        pgChoiceC.ontouchstart = function () {
            parentalGateClose(theProblem[4] == 2);
        };
        pgChoiceC.onmousedown = function () {
            parentalGateClose(theProblem[4] == 2);
        };


        var pgExplain = newHTML('div', 'parentalgateexplain', pgFrame);
        pgExplain.textContent = Localization.localize('PARENTAL_GATE_EXPLANATION');

        function parentalGateClose (success) {
            ScratchAudio.sndFX('exittap.wav');
            gn('frame').removeChild(pgFrame);
            if (success) {
                callback(evt);
            }
        }
    }

    /*
    +    Save the project, including the new name, then package the project and send native-side for sharing
    +
    +    evt: reference to touch event triggering share
    +    nameField: reference to the project rename field
    +    shareLoadingGif: reference to HTML element to show during packaging/loading and hide for completion
    +    shareType: which dialog to show - 0 for email; 1 for airdrop

    保存项目，包括新名称，然后打包项目并发送本地以供共享

    +

    + evt:触摸事件触发共享的引用

    + nameField:引用项目重命名字段

    + shareLoadingGif:引用HTML元素在打包/加载期间显示和隐藏完成

    + shareType:哪个对话框显示- 0电子邮件;空投1个
    + */

    static infoDoShare (evt, nameField, shareLoadingGif, shareType) {
        ScratchAudio.sndFX('tap.wav');
        shareLoadingGif.style.visibility = 'visible';
        nameField.blur(); // Hide the keyboard for name changes

        setTimeout(saveAndShare, 500); // 500ms delay to wait for loading GIF to show and keyboard to hide

        iOS.analyticsEvent('editor', 'share_button', (shareType == 0) ? 'email' : 'airdrop');

        function saveAndShare () {
            // Save the project's new name
            UI.handleTextFieldSave(true);

            // Save any changes made to the project 保存对项目所做的任何更改
            ScratchJr.onHold = true; // Freeze the editing UI 冻结编辑UI
            ScratchJr.stopStripsFromTop(evt);
 
            Project.prepareToSave(ScratchJr.currentProject, function () {
                Alert.close();

                // Package the project as a .sjr file 将项目打包为.sjr文件
                IO.zipProject(ScratchJr.currentProject, function (contents) {
                    //alert(1)
                    ScratchJr.onHold = false; // Unfreeze the editing UI
                    var emailSubject = Localization.localize('SHARING_EMAIL_SUBJECT', {
                        PROJECT_NAME: IO.shareName
                    });
                    iOS.sendSjrToShareDialog(IO.zipFileName, emailSubject, Localization.localize('SHARING_EMAIL_TEXT'),
                        shareType, contents);

                    shareLoadingGif.style.visibility = 'hidden';
                });
            });
        }
    }


    static addEditableName (p) {
        var pname = newHTML('form', 'projectname', p);
        pname.name = 'projectname';
        pname.id = 'title';
        pname.onsubmit = function (evt) {
            submitChange(evt);
        };
        var ti = newHTML('input', 'pnamefield', pname);
        projectNameTextInput = ti;
        ti.name = 'myproject';
        ti.maxLength = 30;
        ti.onkeypress = undefined;
        ti.autocomplete = 'off';
        ti.autocorrect = false;
        ti.onblur = undefined;
        ti.onfocus = function (e) {
            e.preventDefault();
            ti.oldvalue = ti.value;
            if (isAndroid) {
                AndroidInterface.scratchjr_setsoftkeyboardscrolllocation(
                    ti.getBoundingClientRect().top * devicePixelRatio,
                    ti.getBoundingClientRect().bottom * devicePixelRatio
                );
                AndroidInterface.scratchjr_forceShowKeyboard();
            }
        };
        ti.onkeypress = function (evt) {
            handleNamePress(evt);
        };
        function handleNamePress (e) {
            var key = e.keyCode || e.which;
            if (key == 13) {
                submitChange(e);
            }
        }
        function submitChange (e) {
            e.preventDefault();
            var input = e.target;
            input.blur();
        }
        return ti;
    }

    static handleTextFieldSave (dontHide) {
        // Handle story-starter mode project
        if (ScratchJr.isEditable() && ScratchJr.editmode == 'storyStarter' && !Project.error) {
            iOS.analyticsEvent('samples', 'story_starter_edited', Project.metadata.name);
            // Get the new project name
            var sampleName = Localization.localize('SAMPLE_' + Project.metadata.name);
            IO.uniqueProjectName({
                name: sampleName
            }, function (jsonData) {
                var newName = jsonData.name;
                Project.metadata.name = newName;
                // Create the new project
                IO.createProject({
                    name: newName,
                    version: ScratchJr.version,
                    mtime: (new Date()).getTime().toString()
                }, function (md5) {
                    Project.metadata.id = md5;
                    ScratchJr.currentProject = md5;
                    ScratchJr.editmode = 'edit';
                    Project.metadata.gallery = '';
                    UI.finishTextFieldSave(dontHide);
                });
            });
        } else {
            UI.finishTextFieldSave(dontHide);
        }
    }

    static finishTextFieldSave (dontHide) {
        var ti = projectNameTextInput;
        var pname = (ti.value.length == 0) ? ti.oldvalue : ti.value.substring(0, ti.maxLength);
        if (Project.metadata.name != pname) {
            ScratchJr.storyStart('UI.handleTextFieldSave');
        }
        Project.metadata.name = pname;
        ScratchJr.changed = true;
        iOS.setfield(iOS.database, Project.metadata.id, 'name', pname);
        if (!dontHide) {
            ScratchAudio.sndFX('exittap.wav');
            gn('infobox').className = 'infobox fade';
        }
    }


    static showRobotInfo (e) {
              infoBoxOpen = true;
              e.preventDefault();
              e.stopPropagation();

              if (ScratchJr.onHold) {
              return;
              }

              // Prevent button from thrashing
              setTimeout(function () {
                 robot_okclicky.ontouchend = UI.hideRobotInfo;
                  projectNameTextInput.onblur = function () {
              if (isAndroid) {
                  AndroidInterface.scratchjr_forceHideKeyboard();
              }
              };
              }, 500);

              robot_panel.ontouchend = null;

              /* ScratchJr.onBackButtonCallback.push(function () {
              var e2 = document.createEvent('TouchEvent');
              e2.initTouchEvent();
              e2.preventDefault();
              e2.stopPropagation();
              UI.hideInfoBox(e2);
              }); */

              ScratchAudio.sndFX('entertap.wav');
              ScratchJr.stopStrips();

              if (!Project.metadata.ctime) {
                  Project.metadata.mtime = (new Date()).getTime();
                  Project.metadata.ctime = UI.formatTime((new Date()).getTime());
              }

              gn('robot_info').className = 'infobox fade in';

              UI.showRobotSearchingState();

              if (ScratchJr.isEditable()) {
              setTimeout(function () {
              //(document.forms["projectname"]["myproject"]).focus();
              }, 500);
              }
 }


    static showInfoBox (e) {
        infoBoxOpen = true;
        e.preventDefault();
        e.stopPropagation();
        if (Paint.saving) {
            return;
        }
        if (ScratchJr.onHold) {
            return;
        }

        // Prevent button from thrashing
        setTimeout(function () {
            okclicky.ontouchend = UI.hideInfoBox;
            projectNameTextInput.onblur = function () {
                if (isAndroid) {
                    AndroidInterface.scratchjr_forceHideKeyboard();
                }
            };
        }, 500);
        projectNameTextInput.onblur = function () {
            if (ScratchJr.isEditable()) {
                (document.forms.projectname.myproject).focus();
            }
        };
        info.ontouchend = null;

        ScratchJr.onBackButtonCallback.push(function () {
            var e2 = document.createEvent('TouchEvent');
            e2.initTouchEvent();
            e2.preventDefault();
            e2.stopPropagation();
            UI.hideInfoBox(e2);
        });

        ScratchAudio.sndFX('entertap.wav');
        ScratchJr.stopStrips();
        if (!Project.metadata.ctime) {
            Project.metadata.mtime = (new Date()).getTime();
            Project.metadata.ctime = UI.formatTime((new Date()).getTime());
        }

        if (ScratchJr.isEditable()) {
            (document.forms.projectname.myproject).value = Project.metadata.name;
        } else {
            gn('pname').textContent = Project.metadata.name;
        }
        gn('infobox').className = 'infobox fade in';
        if (ScratchJr.isEditable()) {
            setTimeout(function () {
                //(document.forms["projectname"]["myproject"]).focus();
            }, 500);
        }
    }

    static formatTime (unixtime) {
        var date = new Date(unixtime);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
        return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    }

    static hideRobotInfo (e) {
          e.preventDefault();
          e.stopPropagation();
          // ScratchJr.onBackButtonCallback.pop();

          // Prevent button thrashing
          robot_okclicky.ontouchend = null;
          setTimeout(function () {
             info.ontouchend = UI.showRobotInfo;
          }, 500);

          ScratchAudio.sndFX('exittap.wav');
          gn('robot_info').className = 'infobox fade';

          infoBoxOpen = false;
}

    static hideInfoBox (e) {
        e.preventDefault();
        e.stopPropagation();
        ScratchJr.onBackButtonCallback.pop();

        // Prevent button thrashing
        okclicky.ontouchend = null;
        setTimeout(function () {
            info.ontouchend = UI.showInfoBox;
        }, 500);

        if (ScratchJr.isEditable()) {
            (document.forms.projectname.myproject).blur();
            UI.handleTextFieldSave();
        } else {
            ScratchAudio.sndFX('exittap.wav');
            gn('infobox').className = 'infobox fade';
        }
        infoBoxOpen = false;
    }

    //////////////////////////////////////
    //   Library 布局
    /////////////////////////////////////

    static layoutLibrary (sl) {
        var sprites = newHTML('div', 'thumbpanel', sl);
        sprites.setAttribute('id', 'library');
        //scrolling area 滚动区域
        var p = newHTML('div', 'spritethumbs', sprites);
        var div = newHTML('div', 'spritecc', p);
        div.setAttribute('id', 'spritecc');
        div.ontouchstart = UI.spriteThumbsActions;
//AZ
        div.onmousedown = UI.spriteThumbsActions;

        // scrollbar
        var sb = newHTML('div', 'scrollbar', sprites);
        sb.setAttribute('id', 'scrollbar');
        var sbthumb = newHTML('div', 'sbthumb', sb);
        sbthumb.setAttribute('id', 'sbthumb');

        // new sprite
        if (ScratchJr.isEditable()) {
            var ns = newHTML('div', 'addsprite', sprites);
            /*ns.ontouchstart = UI.addSprite;
//AZ
            ns.onmousedown = UI.addSprite;*/
            ns.onclick = UI.addSprite;
        }
    }

    static mascotData (page) {
        var sprAttr = {
            flip: false,
            angle: 0,
            shown: true,
            type: 'sprite',
            scale: 0.5,
            defaultScale: 0.5,
            speed: 2,
            dirx: 1,
            diry: 1,
            sounds: ['pop.mp3'],
            //sounds: [],
            homex: 240,
            homey: 180,
            xcoor: 240,
            ycoor: 180,
            homeshown: true,
            homeflip: false,
            homescale: 0.5,
            scripts: []
        };
        sprAttr.page = page;
        sprAttr.md5 = ScratchJr.defaultSprite;
        var catkey = MediaLib.keys[sprAttr.md5].name;
        sprAttr.id = getIdFor(catkey);
        sprAttr.name = catkey;
        return sprAttr;
    }

    //////////////////////////////////////
    // Scrolling 滚动
    //////////////////////////////////////

    static needsScroll () {//需要滚动
        var sc = gn('spritecc');
        var p = sc.parentNode;
        if (((sc.scrollHeight / p.offsetHeight) == 1) || (gn('spritecc').childElementCount == 0)) {
            gn('scrollbar').setAttribute('class', 'scrollbar off');
        } else {
            gn('scrollbar').setAttribute('class', 'scrollbar on');
            UI.updateSpriteScroll();
          /*if (isTablet){ //modified_by_Yaroslav
            gn('scrollbar').setAttribute('class', 'scrollbar on');
            UI.updateSpriteScroll();
          }else{

                gn('scrollbar').style.display = "none";

                if (sc.scrollHeight > (p.scrollHeight + 5)){
                  gn('spritecc').style.overflowY = "overlay";
                }
          }*/
        }
    }

    static updateSpriteScroll () {//更新精灵卷轴
        var sc = gn('spritecc');
        var dy = sc.offsetTop;
        var p = sc.parentNode;
        var top = -dy / (sc.scrollHeight / p.offsetHeight);
        var size = (p.offsetHeight / sc.scrollHeight) * p.offsetHeight;
        var thumb = gn('sbthumb');
        thumb.style.height = size + 'px';
        thumb.style.top = top + 'px';
    }

    static scrollContents (dy) {//滚动内容
        var sc = gn('spritecc');
        var valy = sc.offsetTop - dy;
        if (valy > 0) {
            valy = 0;
        }
        var transition = {
            duration: 0.5,
            transition: 'ease-out',
            style: {
                top: valy + 'px'
            }
        };
        CSSTransition(sc, transition);
    }

    static spriteInView (spr) {//视图中的精灵
        var sc = gn('spritecc');
        var achild = spr.thumbnail;
        if (!achild) {
            return;
        }
        var h = gn('spritecc').parentNode.offsetHeight;
        var scroll = -gn('spritecc').offsetTop;
        var dy = -gn('spritecc').offsetTop;
        if ((achild.offsetTop + achild.offsetHeight + scroll) > h) {
            dy = h - (achild.offsetTop + achild.offsetHeight);
        }
        if (achild.offsetTop <= scroll) {
            dy = achild.offsetTop + scroll;
        }
        if (dy > 0) {
            dy = 0;
        }
/*
        if (isTablet){  //modified_by_Yaroslav
        sc.style.top = dy + 'px';
      }*/
      sc.style.top = dy + 'px';
        UI.needsScroll();
    }

    static resetSpriteLibrary () {//重置精灵库
        if (!ScratchJr.getSprite()) {
            return;
        }
        UI.spriteInView(ScratchJr.getSprite());
    }

    ///////////////////////////////////
    // Sprite Thumbs Events 精灵拇指事件
    //////////////////////////////////

    static spriteThumbsActions (e) {//精灵拇指动作
        if (isTablet && e.touches && (e.touches.length > 1)) {
            return;
        }
        if (ScratchJr.onHold) {
            return;
        }
        var t;
        var pt = Events.getTargetPoint(e);
        if (window.event) {
            t = window.event.srcElement;
        } else {
            t = e.target;
        }
        //	if ((t.nodeName == "INPUT") || (t.nodeName == "FORM")) return;
        e.preventDefault();
        e.stopPropagation();
        ScratchJr.blur();
        t.focus();
        if (t.className == 'brush') {
            UI.putInPaintEditor(e); return;
        }
        var tb = Thumbs.getType(t, 'spritethumb');
        if (!tb) {
            if (ScratchJr.shaking) {
                ScratchJr.clearSelection();
            }
            return;
        }
        var x = localx(t, pt.x);
        if (tb && (x < 70) && ScratchJr.isEditable()) {
            Thumbs.startDragThumb(e, tb);//开始拖动拇指

        } else {
            UI.startSpriteScroll(e, tb);//启动精灵卷轴
        }
    }

    static startSpriteScroll (e, tb) {//启动精灵卷轴
        if (ScratchJr.shaking) {
            ScratchJr.clearSelection();
        }
        if (!tb) {
            return;
        }
        if (gn('scrollbar').className == 'scrollbar off') {
            Events.startDrag(e, tb, UI.ignoreEvent, UI.ignoreEvent, UI.ignoreEvent, UI.spriteClicked,
                ScratchJr.isEditable() ? Thumbs.startCharShaking : undefined);
        } else {
            Events.startDrag(e, tb, UI.prepareToScroll, UI.stopScroll, UI.spriteScolling, UI.spriteClicked,
                ScratchJr.isEditable() ? Thumbs.startCharShaking : undefined);
        }
    }

    static ignoreEvent (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    static prepareToScroll (e) {
        e.preventDefault();
        e.stopPropagation();
        UI.spriteScolling(e, Events.dragthumbnail);
    }

    static stopScroll (e) {
        e.preventDefault();
        e.stopPropagation();
        UI.spriteScolling(e, Events.dragthumbnail);
    }

    static spriteScolling (e) {
        var pt = Events.getTargetPoint(e);
        var deltay = Events.dragmousey - pt.y;
        Events.dragmousey = pt.y;
        var sc = gn('spritecc');
        var dy = sc.offsetTop;
        dy -= deltay;
        var p = sc.parentNode;
        if (dy > 0) {
            dy = 0;
        }
        if ((dy + sc.offsetHeight) < p.offsetHeight) {
            dy = p.offsetHeight - sc.offsetHeight;
        }
        sc.style.top = dy + 'px';
        UI.updateSpriteScroll();
    }

    static spriteClicked (e, el) {
        e.preventDefault();
        e.stopPropagation();
        var t;
        if (window.event) {
            t = window.event.srcElement;
        } else {
            t = e.target;
        }
        if (ScratchJr.isEditable() && ScratchJr.getSprite() &&
            (((t.className == 'sname') && (el.owner == ScratchJr.getSprite().id))
            || (t.className == 'brush'))) {
            UI.putInPaintEditor(e);
            return;
        }
        if (el.className.indexOf('shakeme') < 0) {
            el.setAttribute('class', 'spritethumb on');
        }
        Thumbs.clickOnSprite(e, el);
    }

    static putInPaintEditor (e) {
        ScratchJr.unfocus(e);

        var s = ScratchJr.getSprite();
        if (!s) {
            return;
        }
        ScratchJr.stopStrips();
        Paint.open(false, s.md5, s.id, s.name, s.defaultScale, Math.round(s.w), Math.round(s.h));
    }

    ///////////////////////////////
    // Setup Stage Variables
    //////////////////////////////

    static stageArea (inner) {
        var outerDiv = newHTML('div', 'centerpanel', inner);
        var div = newHTML('div', 'stageframe', outerDiv);
        div.setAttribute('id', 'stageframe');
        ScratchJr.stage = new Stage(div);
        Grid.init(div);
        if (ScratchJr.isEditable()) {
            UI.creatTopBarClicky(div, 'addtext', 'addText', UI.addText);
            UI.creatTopBarClicky(div, 'setbkg', 'changeBkg', UI.addBackground);//背景

            UI.creatTopBarClicky(div, 'RobotConsole', 'RobotConsole', UI.RobotConsole); //控制台
            UI.creatTopBarClicky(div, 'bleUpName', 'bleUpName', UI.bleUpName); //蓝牙改名
        }
        UI.creatTopBarClicky(div, 'grid', 'gridToggle off', UI.switchGrid);
        UI.creatTopBarClicky(div, 'go', 'go on', UI.toggleRun);
        UI.creatTopBarClicky(div, 'resetall', 'resetall', UI.resetAllSprites);
        UI.creatTopBarClicky(div, 'full', 'fullscreen', ScratchJr.fullScreen);//全屏

        // UI.creatTopBarClicky(div, 'ai_btn', 'ai_btn', UI.showAIDialog);//开启ai视窗

        if (isTablet){//未连接

        // UI.creatTopBarClicky(div, 'robot_search', 'robot_search', UI.StartDeviceSearch); //蓝牙   //modified_by_Yaroslav  雅罗斯拉夫
         
         

         //UI.creatTopBarClicky(div, 'robot_dis', 'robot_dis', UI.Disconnect); //断开

      }

      if (!isTablet){

        UI.creatTopBarClicky(div, 'robot_connection_status', 'robot_connection_status', null); //modified_by_Yaroslav

    }


       //UI.creatTopBarClicky(div, 'project_save', 'project_save', UI.saveAndShare); //modified_by_Yaroslav   保存
    //   UI.creatTopBarClicky(div, 'project_load', 'project_load', UI.SjrFileChoose); //modified_by_Yaroslav

        UI.toggleGrid(true);
    }

    static resetAllSprites (e) {
        e.preventDefault();
        e.stopPropagation();
        if (ScratchJr.onHold) {
            return;
        }
        ScratchAudio.sndFX('tap.wav');
        if (!ScratchJr.runtime.inactive()) {
            ScratchJr.stopStripsFromTop(e);
        }
        ScratchJr.resetSprites();
    }

    static toggleRun (e) {
        var isOff = ScratchJr.runtime.inactive();
        AndroidInterface.sendData("INIT",0);

        //初始化传感器数据
        window.tilt_data=["",""];//倾斜传感器读取到的数值  端口--值

        window.light_data1=["",""];//光电1读取到的数值  端口--值
        window.light_data2=["",""];//光电2读取到的数值  端口--值

        window.button_data1=["",""];//按钮1读取到的数值  端口--值
        window.button_data2=["",""];//按钮2读取到的数值  端口--值

        window.voice_data=["",""];//语音读取到的数值  端口--值

        window.port1="";//端口1
        window.port2="";//端口2
        

        if (isOff) {//开始
            ScratchJr.runStrips(e);
        } else {//结束
            AndroidInterface.sendData("INIT",0);
            //Robot.motor_stopP();
            ScratchJr.stopStripsFromTop(e);
        }
    }

    static switchGrid () {
        ScratchAudio.sndFX('tap.wav');
        UI.toggleGrid(!Grid.hidden);
    }

    static toggleGrid (b) {
        Grid.hide(b);
        gn('grid').className = Grid.hidden ? 'gridToggle off' : 'gridToggle on';
    }

    static creatTopBarClicky (p, str, mstyle, fcn) {
        var toggle = newHTML('div', mstyle, p);

     if (isTablet){

        toggle.ontouchstart = fcn

      }else{

          toggle.onmousedown = fcn;

      }
//AZ


        toggle.setAttribute('id', str);
    }

    static fullscreenControls () {
        UI.nextpage = newHTML('div', 'nextpage off', frame);
        UI.prevpage = newHTML('div', 'nextpage off', frame);
        if (isTablet) {
            UI.nextpage.ontouchstart = UI.nextPage;
        } else {
            UI.nextpage.onmousedown = UI.nextPage;
        }
        if (isTablet) {
            UI.prevpage.ontouchstart = UI.prevPage;
        } else {
            UI.prevpage.onmousedown = UI.prevPage;
        }
    }

    static updatePageControls () {
        var n = ScratchJr.stage.pages.indexOf(ScratchJr.stage.currentPage);
        if (n == 0) {
            UI.prevpage.setAttribute('class', 'prevpage off');
        } else {
            UI.prevpage.setAttribute('class', 'prevpage on');
        }
        if (n == (ScratchJr.stage.pages.length - 1)) {
            UI.nextpage.setAttribute('class', 'nextpage off');
        } else {
            UI.nextpage.setAttribute('class', 'nextpage on');
        }
    }

    static nextPage (e) {
        e.preventDefault();
        e.stopPropagation();
        var n = ScratchJr.stage.pages.indexOf(ScratchJr.stage.currentPage);
        n++;
        if (n >= ScratchJr.stage.pages.length) {
            return;
        }
        ScratchJr.stage.setPage(ScratchJr.stage.pages[n], false);
    }

    static prevPage (e) {
        e.preventDefault();
        e.stopPropagation();
        var n = ScratchJr.stage.pages.indexOf(ScratchJr.stage.currentPage);
        if (n < 1) {
            return;
        }
        ScratchJr.stage.setPage(ScratchJr.stage.pages[n - 1], false);
    }

    static enterFullScreen () {
        var w = Math.min(getDocumentWidth(), frame.offsetWidth);
        var h = Math.max(getDocumentHeight(), frame.offsetHeight);
        frame.appendChild(gn('stage'));
        var list = ['go', 'full'];
        for (var i = 0; i < list.length; i++) {
            gn(list[i]).className = gn(list[i]).className + ' presentationmode';
            frame.appendChild(gn(list[i]));
        }
        var scale = Math.min((w - (136 * scaleMultiplier)) / gn('stage').owner.width, h / gn('stage').owner.height);
        var dx = Math.floor((w - (gn('stage').owner.width * scale)) / 2);
        var dy = Math.floor((h - (gn('stage').owner.height * scale)) / 2);

        ScratchJr.stage.setStageScaleAndPosition(scale, dx / scale, dy / scale);

        gn('stage').owner.currentZoom = Math.floor(scale * 100) / 100;
        gn('stage').style.webkitTextSizeAdjust = Math.floor(gn('stage').owner.currentZoom * 100) + '%';
        document.body.parentNode.style.background = 'black';
        gn('stage').setAttribute('class', 'stage fullscreen');
        UI.nextpage.setAttribute('class', 'nextpage on');
    }

    static quitFullScreen () {
        var div = gn('stageframe');
        div.appendChild(gn('stage'));
        ScratchJr.stage.setStageScaleAndPosition(scaleMultiplier, 46, 74);
        gn('go').className = 'go off nopresent';
        div.appendChild(gn('go'));
        gn('full').className = 'fullscreen';
        div.appendChild(gn('full'));
        gn('stage').owner.currentZoom = 1;
        gn('stage').style.webkitTextSizeAdjust = '100%';
        document.body.parentNode.style.background = 'none';
        gn('stage').setAttribute('class', 'stage normal');
        UI.nextpage.setAttribute('class', 'nextpage off');
        UI.prevpage.setAttribute('class', 'nextpage off');
        ScratchJr.stage.setViewPage(ScratchJr.stage.currentPage);
        Thumbs.updateSprites();
        Thumbs.updatePages();
    }

    //////////////////////////////////////
    //   Right panel
    /////////////////////////////////////

    static rightPanel (div) {
        var rp = newHTML('div', 'rightpanel', div);
        var tb = newHTML('div', 'pages', rp);
        tb.setAttribute('id', 'pages');
        var ndiv = newHTML('div', 'pagescc', tb);
        ndiv.setAttribute('id', 'pagecc');

        //控制台
        /*var RobotConsole = newHTML('div', 'RobotConsole', div);
        RobotConsole.setAttribute('id', 'RobotConsole');

        RobotConsole.onclick = function (evt) {
            UI.RobotConsole();
        }; */
    }

    //////////////////////////////////////
    //   Tools
    /////////////////////////////////////

    static layoutToolbar (div) {
        var h = 56;
        var w = 66 * 2;
        var tb = newDiv(div, 220, 0, w, h, {
            position: 'absolute'
        });
        tb.setAttribute('id', 'toolbar');
        var addt = newHTML('div', 'addText', tb);

        addt.ontouchstart = UI.addText;
//AZ
        addt.onmousedown = UI.addText;

        var changebkg = newHTML('div', 'changeBkg', tb);

        changebkg.ontouchstart = UI.addBackground;
//AZ
        changebkg.onclick = UI.addBackground;
    }

    static addSprite (e) {//增加精灵
        if (ScratchJr.onHold) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        var pt = Events.getTargetPoint(e);
        if (pt.x > (globalx(e.target) + 167)) {
            return;
        }
        ScratchAudio.sndFX('tap.wav');
        ScratchJr.stopStrips();
        ScratchJr.unfocus(e);
        if (Events.dragthumbnail) {
            Events.mouseUp(e);
        }
        Library.open('costumes');
    }

    static addBackground (e) {
        if (ScratchJr.onHold) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        ScratchJr.stopStrips();
        ScratchJr.unfocus(e);
        if (Events.dragthumbnail) {
            Events.mouseUp(e);
        }
        Library.open('backgrounds');
    }

    static addText (e) {
        if (ScratchJr.onHold) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (isAndroid) {
            if (gn('textbox').style.visibility === 'visible') {
                return;
            }
        }
        ScratchJr.unfocus(e);
        ScratchJr.stage.currentPage.createText();
    }

    //////////////////////////////////
    // Key Handling in TextBox
    //////////////////////////////////

    static createFormForText (p) {
        var tf = newHTML('div', 'pagetext off', p);
        tf.setAttribute('id', 'textbox');
        if (isAndroid) {
            tf.onmousedown = function (e) {
                e.preventDefault();
            };
        }
        var activetb = newHTML('form', 'pageform', tf);
        activetb.name = 'activetextbox';
        activetb.id = 'myform';
        activetb.textsprite = null;
        var field = newTextInput(activetb, 'text');
        field.name = 'typing';
        field.setAttribute('class', 'edittext');
        field.maxLength = 50;
        field.onkeypress = undefined;
        field.autocomplete = 'off';
        field.autocorrect = false;
        field.onblur = undefined;
        activetb.onsubmit = undefined;
        var ta = newHTML('div', 'pagetextactions', tf);
        var clicky = newHTML('div', 'fontsizeText off', ta);
        clicky.setAttribute('id', 'fontsizebutton');
        clicky.ontouchstart = UI.openFontSizeMenu;
//AZ
        clicky.onmousedown = UI.openFontSizeMenu;

        var col = newHTML('div', 'changecolorText off', ta);
        col.setAttribute('id', 'fontcolorbutton');

        col.ontouchstart = UI.topLevelColor;
//AZ
        col.onmousedown = UI.topLevelColor;


        UI.createColorMenu(tf);
        UI.createTextSizeMenu(tf);
    }

    static createColorMenu (div) {
        var swatchlist = BlockSpecs.fontcolors;
        var spal = newHTML('div', 'textuicolormenu off', div);
        spal.setAttribute('id', 'textcolormenu');
        for (var i = 0; i < swatchlist.length; i++) {
            var colour = newHTML('div', 'textcolorbucket', spal);
            // bucket
            var sf = newHTML('div', 'swatchframe', colour);
            var sc = newHTML('div', 'swatchcolor', sf);
            sc.style.background = swatchlist[i];
            //
            sf = newHTML('div', 'splasharea off', colour);
            Paint.setSplashColor(sf, Paint.splash, swatchlist[i]);
            Paint.addImageUrl(sf, Paint.splashshade);

//AZ
            colour.ontouchstart = UI.setTextColor;
            colour.onmousedown = UI.setTextColor;
        }
        UI.setMenuTextColor(gn('textcolormenu').childNodes[9]);
    }

    static createTextSizeMenu (div) {
        var sizes = BlockSpecs.fontsizes;
        var spal = newHTML('div', 'textuifont off', div);
        spal.setAttribute('id', 'textfontsizes');
        for (var i = 0; i < sizes.length; i++) {
            var textuisize = newHTML('div', 'textuisize t' + (i + 1), spal);
            textuisize.fs = sizes[i];
            var sf = newHTML('span', undefined, textuisize);
            sf.textContent = 'A';
//AZ
            textuisize.ontouchstart = UI.setTextSize;
            textuisize.onmousedown  = UI.setTextSize;
        }
        UI.setMenuTextSize(gn('textfontsizes').childNodes[5]);
    }

    static setMenuTextColor (t) {
        var c = t.childNodes[0].childNodes[0].style.backgroundColor;
        for (var i = 0; i < gn('textcolormenu').childElementCount; i++) {
            var mycolor = gn('textcolormenu').childNodes[i].childNodes[0].childNodes[0].style.backgroundColor;
            if (c == mycolor) {
                gn('textcolormenu').childNodes[i].childNodes[1].setAttribute('class', 'splasharea on');
            } else {
                gn('textcolormenu').childNodes[i].childNodes[1].setAttribute('class', 'splasharea off');
            }
        }
    }

    static setMenuTextSize (t) {
        var c = t.fs;
        for (var i = 0; i < gn('textfontsizes').childElementCount; i++) {
            var kid = gn('textfontsizes').childNodes[i];
            var fs = kid.fs;
            var ckid = kid.className.split(' ')[1];
            if (c == fs) {
                gn('textfontsizes').childNodes[i].className = 'textuisize ' + ckid + ' on';
            } else {
                gn('textfontsizes').childNodes[i].className = 'textuisize ' + ckid + ' off';
            }
        }
    }

    /////////////////////////////////////////////////////////
    // Text color and size
    /////////////////////////////////////////////////////////

    static topLevelColor (e) {
        e.preventDefault();
        e.stopPropagation();
        if (gn('fontcolorbutton').className == 'changecolorText on') {
            gn('fontcolorbutton').className = 'changecolorText off';
            gn('textcolormenu').className = 'textuicolormenu off';
        } else {
            gn('fontsizebutton').className = 'fontsizeText off';
            gn('textfontsizes').className = 'textuifont off';
            var text = document.forms.activetextbox.textsprite;
            var indx = BlockSpecs.fontcolors.indexOf(text);
            if (indx > -1) {
                UI.setMenuTextColor(gn('textcolormenu').childNodes[indx]);
            }
            gn('textcolormenu').className = 'textuicolormenu on';
            gn('fontcolorbutton').className = 'changecolorText on';
        }
    }

    static setTextColor (e) {
        if (e.touches && (e.touches.length > 1)) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (window.event) {
            t = window.event.srcElement;
        } else {
            t = e.target;
        }
        var b = 'textcolorbucket' != t.className;
        while (b) {
            var t = t.parentNode;
            b = t && ('textcolorbucket' != t.className);
        }
        if (!t) {
            return;
        }
        ScratchAudio.sndFX('splash.wav');
        UI.setMenuTextColor(t);
        var text = document.forms.activetextbox.textsprite;
        var c = t.childNodes[0].childNodes[0].style.background;
        text.setColor(c);
        Undo.record({
            action: 'edittext',
            where: text.div.parentNode.owner.id,
            who: text.id
        });
        ScratchJr.storyStart('UI.setTextColor'); // Record a change for sample projects in story-starter mode
        var ti = document.forms.activetextbox.typing;
        ti.style.color = c;
    }

    static openFontSizeMenu (e) {
        e.preventDefault();
        e.stopPropagation();
        if (gn('fontsizebutton').className == 'fontsizeText on') {
            gn('fontsizebutton').className = 'fontsizeText off';
            gn('textfontsizes').className = 'textuifont off';
        } else {
            gn('fontcolorbutton').className = 'changecolorText off';
            gn('textcolormenu').className = 'textuicolormenu off';
            var text = document.forms.activetextbox.textsprite;
            var indx = BlockSpecs.fontsizes.indexOf(text.fontsize);
            if (indx > -1) {
                UI.setMenuTextSize(gn('textfontsizes').childNodes[indx]);
            }
            gn('textfontsizes').className = 'textuifont on';
            gn('fontsizebutton').className = 'fontsizeText on';
        }
    }

    static setTextSize (e) {
        e.preventDefault();
        e.stopPropagation();
        var t;
        if (window.event) {
            t = window.event.srcElement;
        } else {
            t = e.target;
        }
        if (t.nodeName == 'SPAN') {
            t = t.parentNode;
        }
        if (!t) {
            return;
        }
        var ckid = t.className.split(' ')[0];
        if (ckid != 'textuisize') {
            return;
        }
        UI.setMenuTextSize(t);
        var text = document.forms.activetextbox.textsprite;
        text.setFontSize(t.fs);
        Undo.record({
            action: 'edittext',
            where: text.div.parentNode.owner.id,
            who: text.id
        });
        ScratchJr.storyStart('UI.setTextSize'); // Record a change for sample projects in story-starter mode
        var ti = document.forms.activetextbox.typing;
        ti.style.fontSize = (t.fs * scaleMultiplier) + 'px';
        setProps(document.forms.activetextbox.style, {
            height: ((t.fs + 10) * scaleMultiplier) + 'px'
        });
    }

    ///////////////////////////////////////////
    // UI clear
    /////////////////////////////////////////

    static clear () {
        var costumes = gn('spritecc');
        while (costumes.childElementCount > 0) {
            costumes.removeChild(costumes.childNodes[0]);
        }
        var pthumbs = gn('pagecc');
        while (pthumbs.childElementCount > 0) {
            pthumbs.removeChild(pthumbs.childNodes[0]);
        }
    }
}

window.UI = UI;
