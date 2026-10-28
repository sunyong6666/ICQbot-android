import ScratchAudio from '../utils/ScratchAudio';
import {gn, getUrlVars, isAndroid, isiOS} from '../utils/lib';
import iOS from '../iPad/iOS';
import UI from '../editor/ui/UI';
import Localization from '../utils/Localization';
import Cookie from '../utils/Cookie';

//window.url_h="http://192.168.137.1:8081";//信誉
window.url_h="http://119.3.123.115:8080";//






var thisVersion='2.4.0';//当前版本
var YSlanguang,xtys;

var get_v=null;

export default class YSXY {
    static setLanguageYSXY(a) {
        if(a=='zh'){
            gn('yinsiTIT').textContent='温馨提示';
            gn('yinsiFalse').textContent='不同意并退出';
            gn('yinsiTrue').textContent='同意并使用';
            gn('yinsiCON1').textContent="本APP采用严格的数据安全措施保护您的隐私安全。请充分阅读";
            gn('yinsiCON2').textContent="以及";
            gn('yinsiCON3').textContent="后点击“同意并使用”。您也可以选择“不同意并退出”，本APP将无法为您提供产品和服务。";
            gn('yh').textContent="《"+zhYHXY[0]+"》";
            gn('ys').textContent="《"+zhYSZC[0]+"》";
            gn('yh-tit').textContent=zhYHXY[0];
            gn('yh-con').innerHTML=zhYHXY[1];
            gn('ys-tit').textContent=zhYSZC[0];
            gn('ys-con').innerHTML=zhYSZC[1];
        }else{
            gn('yinsiTIT').textContent='Warm Reminder';
            gn('yinsiFalse').textContent='Disagree';
            gn('yinsiTrue').textContent='Agree and use';
            gn('yinsiCON1').textContent="The APP adopts strict data security measures to protect your privacy. Please read ";
            gn('yinsiCON2').textContent="and";
            gn('yinsiCON3').textContent="thoroughly and click “Agree and use“. You can also choose “Disagree“, the APP will not be able to provide you with products and services. ";
            gn('yh').textContent="《"+enYHXY[0]+"》";
            gn('ys').textContent="《"+enYSZC[0]+"》";
            gn('yh-tit').textContent=enYHXY[0];
            gn('yh-con').innerHTML=enYHXY[1];
            gn('ys-tit').textContent=enYSZC[0];
            gn('ys-con').innerHTML=enYSZC[1];
        }


        gn('yinsiPAGE').onclick = closeLook;
        gn('yinsiPAGE1').onclick = closeLook1;
        gn('yh').onclick = lookYH;
        gn('ys').onclick = lookYS;

        gn('yinsiFalse').onclick = exit;
        gn('yinsiTrue').onclick = play;
        if(xtys!='T'){
            gn('yinsiPAGE').style.display="block";
        }else{
            AndroidInterface.getLimits();
        }
    }
}
window.YSXY = YSXY;
export function indexMain () { 
    AndroidInterface.getLung();
    xtys = Cookie.get('ys');
    
    
    gn('gettings').ontouchend = indexGettingstarted;
    gn('startcode').ontouchend = indexGohome;

//AZ
    gn('gettings').onclick = indexGettingstarted;
    gn('startcode').onclick = indexGohome;

    
    gn('ysbutton').onclick = showYS;


    ScratchAudio.init();
    var urlvars = getUrlVars();
    if (urlvars.back) {
        indexLoadOptions();
    } else {
        indexFirstTime();
    }

    if (window.Settings.edition == 'PBS') {
        gn('topbar-moreapps').textContent = Localization.localize('PBS_MORE_APPS');
        gn('startButton').textContent = Localization.localize('PBS_START');
        gn('gettings').textContent = Localization.localize('PBS_HOW_TO');

        gn('startButton').ontouchend = indexGohome;
        gn('pbschars').ontouchend = indexGohome;

        gn('topbar-moreapps').ontouchstart = indexMoreApps;
        gn('topbar-settings').ontouchstart = indexGoSettings;
        gn('topbar-info').ontouchstart = indexInfo;

        
    } else {
        gn('gear').ontouchstart = indexGoSettings;
        gn('gear').onclick = indexGoSettings;
    }

    setTimeout(function () {
        gn('rays').className = 'rays spinme';
    }, 250);
    
    setTimeout(function() {
        get_v.abort();
    }, 2000);
    //checkServerStatus();
    //Version();//版本验证
    
}

function indexFirstTime () {
    gn('authors').className = 'credits show';
    gn('authorsText').className = 'creditsText show';
    if (window.Settings.edition == 'PBS') {
        gn('pbschars').className = 'characters hide';
        gn('startcode').className = 'catlogo show';
        gn('topbar').className = 'topbar hide';
        gn('startButton').className = 'startButton hide';
    } else {

        gn('purpleguy').className = 'purple show';
        gn('blueguy').className = 'blue show';
        gn('redguy').className = 'red show';
    }
    iOS.askpermission(); // ask for sound recording
    setTimeout(function () {
        iOS.hidesplash(doit);
    }, 500);
    function doit () {
        window.ontouchend = function () {
            indexLoadOptions();
        };
    }
    setTimeout(function () {
        indexLoadOptions();
    }, 2000);
}

function indexLoadOptions () {
    gn('authors').className = 'credits hide';
    gn('authorsText').className = 'creditsText hide';

    if (window.Settings.edition == 'PBS') {
        gn('pbschars').className = 'characters show';
        gn('topbar').className = 'topbar show';
        gn('startButton').className = 'startButton show';
    } else {
        gn('purpleguy').className = 'purple hide';
        gn('blueguy').className = 'blue hide';
        gn('redguy').className = 'red hide';
        gn('gear').className = 'gear show';
    }
    gn('gettings').className = 'gettings show';
    gn('startcode').className = 'startcode show';
    document.ontouchmove = function (e) {
        e.preventDefault();
    };
    if (isAndroid) {
        AndroidInterface.notifySplashDone();
    }
}

function indexGohome () {
    //alert(document.cookie)
    //AndroidInterface.getLimits();
    iOS.setfile('homescroll.sjr', 0, function () {
        
        doNext();
    });
    function doNext () {
        window.location.href = 'home.html';
    }
}

function indexGoSettings () {
    // Switch to the settings selection page
    // Triggered by tapping the gear icon in the top right
    ScratchAudio.sndFX('tap.wav');
    window.location.href = 'home.html?place=gear';

}

function indexGettingstarted () {
    ScratchAudio.sndFX('tap.wav');
    //window.location.href = 'gettingstarted.html?place=home';
    window.location.href = 'home.html?place=help';
}

// For PBS KIDS edition only
function indexInfo () {
    ScratchAudio.sndFX('tap.wav');

    window.location.href = 'home.html?place=book';

}

function indexMoreApps () {
    ScratchAudio.sndFX('tap.wav');

    UI.parentalGate(null, function () {
        if (isiOS) {
            window.location.href = 'https://itunes.apple.com/us/developer/pbs-kids/id324323339?mt=8';
        } else {
            window.location.href = 'http://to.pbs.org/ScJr_GPlay';
        }
    });
}


//版本验证
function Version () {
    get_v=$.ajax({
        type: "post",
        url: url_h+"/appVersionManage/getAppState",  //发送到的服务器             
        data: {
            appName:"'ICQbot'",
            AppVersion: "'"+thisVersion+"'"
        },
        //async:false,      //异步请求
        dataType:'json',//服务器返回的数据类型
        timeout:2000,
        success: function(result) {
            if (result.data.newAppVersion != thisVersion) {//不是最新版本
                setTimeout(function() {
                    open_popover("ICQbot"+result.data.newAppVersion+Localization.localize('INDEX_VERSION_UP'),5000);
                }, 2000);
            }else{

            }
        },
        error(XMLHttpRequest, textStatus, errorThrown){
            //alert(textStatus)
            if(textStatus==='timeout' ||textStatus==='abort'){
                open_popover(result.data.newAppVersion+Localization.localize('INDEX_VERSION_SEVERR'),1000);
            }else{
                //setTimeout(function() {
                    open_popover(Localization.localize('INDEX_VERSION_INTERR'),5000);
                //}, 2000);
            }
            
           
        }
    })
}


//打开弹窗
function open_popover (a,s) {
    gn('popover_p').className = '';
    gn('popover_text').innerHTML=a;
    setTimeout(function() {
        gn('popover_p').className = 'hidden';
    }, s);
}


function checkServerStatus() {
    var xhr = new XMLHttpRequest(); // 创建XMLHttpRequest对象
    
    xhr.open('GET', url_h+"/appVersionManage/getAppState?appName='ICQbot'&AppVersion='"+thisVersion+"'"); // 设置请求类型为GET，URL为要测试的服务器地址
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) { // readyState表示当前请求的状态，值为4时表示已完成
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) { // status属性表示服务器返回的状态码
                alert("服务器正常运行");
            } else {
                alert("无法连接到服务器或者服务器未能正确响应");
            }
        }
    };
    
    xhr.send(null); // 发送请求
}



function closeLook(event){
    if(event.target.id=='yh' ||event.target.id=='ys' ||event.target.id=='yinsiFalse' || event.target.id=='yinsiTrue'){
        return
    }
    gn('yhCON').style.display="none";
    gn('ysCON').style.display="none";
}
function closeLook1(event){
    if(event.target.id=='yh' ||event.target.id=='ys' ||event.target.id=='yinsiFalse' || event.target.id=='yinsiTrue'){
        return
    }
    gn('yinsiPAGE1').style.display="none";
}
function lookYH(){
    gn('yhCON').style.display="block";
}
function lookYS(){
    gn('ysCON').style.display="block";
}

function exit(){
    AndroidInterface.exitBAY();
}

function play(){
    Cookie.set('ys', "T");
    gn('yinsiPAGE').style.display="none";
    //AndroidInterface.getLimits();
}

function showYS(){
    gn('ys-tit1').textContent=Localization.localize('YSZC_TIT');
    gn('ys-con1').innerHTML=Localization.localize('YSZC_CON');
    gn('yinsiPAGE1').style.display="block";
}



let zhYHXY=['用户协议',`
尊敬的用户，您好！欢迎使用ICQbot编程软件（以下简称“本软件”）及相关服务。本协议由用户（以下简称“您”或“用户”）与山东艾克瑞特教育科技有限公司（以下简称“艾克瑞特”或“我们”）共同签订。请在使用本软件及服务前，仔细阅读以下条款，确保您充分理解并同意本协议内容。
如果您对协议内容有任何疑问，请随时通过icrobot@163.com联系我们。

<b>一、服务范围及说明</b>
1.1服务内容
本软件旨在为用户提供简易、趣味化的编程工具及相关硬件支持服务，包括但不限于代码编写、硬件交互、项目管理、资源共享及社区交流。

1.2适用范围
本协议适用于本软件及其所有相关服务，包括移动端应用、网页端工具以及与ICQbot相关的所有附属功能和硬件服务。

<b>二、用户使用规则</b>
2.1 用户行为规范
用户在使用本软件过程中应遵守国家法律法规及社会公共道德，不得利用本软件从事任何违法、违规或不当活动，包括但不限于以下内容：
传播含有恶意代码、虚假信息、违法内容的文件。
利用本软件进行商业广告、骚扰行为或其他未经许可的行为。
违反任何适用的法律法规或侵犯第三方合法权益的行为。

2.2 软件限制
用户不得实施以下行为：
对本软件及其组件进行反向工程、反编译或破解。
擅自修改、删除或屏蔽版权声明及相关提示。
未经授权，复制、转让、分发本软件或其内容。

2.3 用户责任
因用户违规操作或非法行为导致的任何争议、赔偿、罚款或其他法律责任，用户应独自承担，并赔偿因此给艾克瑞特造成的损失。

<b>三、隐私保护及数据安全</b>
3.1 用户隐私保护
我们承诺严格保护用户隐私，仅在必要范围内收集和使用您的个人信息，具体包括但不限于以下场景：
设备权限获取：相机、录音、读写、蓝牙和定位权限仅用于软件功能实现，不会用于其他目的。
数据使用：用户上传的照片、声音和作品将仅用于本地存储或蓝牙传输。

3.2 数据安全措施
我们采取加密存储和传输方式，确保用户数据安全。
非经用户授权或法律要求，艾克瑞特绝不会向任何第三方泄露用户数据。

<b>四、知识产权声明</b>
4.1 版权和商标
本软件及其相关内容（包括但不限于代码、文字、图片、商标、界面设计）均归艾克瑞特及其授权方所有。
用户不得擅自使用或传播本软件的任何内容，未经授权的行为将追究法律责任。

4.2 用户作品的使用权
用户通过本软件创建的作品，其知识产权归用户所有。
用户授权艾克瑞特可出于产品优化、功能测试或推广目的，使用用户的非私密作品，并始终确保您的隐私数据不被泄露。

<b>五、免责条款</b>
5.1 服务风险提示
本软件可能因技术问题、第三方服务中断或不可抗力因素导致部分功能暂时不可用。艾克瑞特不对因此产生的直接或间接损失承担责任。
我们不对因用户操作不当或设备故障导致的数据丢失、硬件损坏负责。

5.2 第三方服务
本软件可能集成第三方提供的服务（如云存储、支付接口）。对于这些服务中的问题或争议，请联系第三方处理，我们对此不承担责任。

<b>六、未成年人特别保护条款</b>
若用户为18周岁以下的未成年人，需在家长或法定监护人的监督下使用本软件。
艾克瑞特建议家长采取合理措施监控未成年人的在线行为，以防止沉迷或接触不良信息。

<b>七、协议的变更与终止</b>
7.1 协议的修改
艾克瑞特保留根据实际情况修改本协议条款的权利，且无需另行通知。若您不同意修改内容，应立即停止使用服务。

7.2 服务终止
若用户违反本协议或法律法规，我们有权立即停止服务并追究相关责任。

<b>八、争议解决及适用法律</b>
本协议的签署、执行、解释及争议解决适用中华人民共和国法律。
因本协议引起的争议，应首先通过友好协商解决；协商不成的，任何一方可向艾克瑞特所在地人民法院提起诉讼。

<b>九、联系我们</b>
公司名称：山东艾克瑞特教育科技有限公司
联系邮箱：icrobot@163.com
联系电话：400-075-7778

此协议即日起生效，感谢您对ICQbot编程软件的支持与信任!`]
let zhYSZC=['隐私政策',`尊敬的用户，感谢您使用 ICQbot 软件（以下简称“本软件”）。我们非常重视您的隐私保护，并致力于保护您的个人信息和隐私安全。本隐私政策旨在说明在您使用本软件时，我们如何收集、使用和保护您的信息。

<b>一、我们如何收集和使用信息</b>
本软件不涉及注册流程，也不会向服务器上传您的任何个人信息。您在使用本软件的过程中，仅需授权以下设备权限，以保证相关功能的正常运行：
1）相机权限
用途：用于给添加的角色拍摄照片。
特别说明：照片保存在您的设备本地，不会被上传或共享。
2）麦克风权限
用途：用于录制音频，为角色添加声音效果。
特别说明：录音数据仅用于本地存储和播放，不会被上传或存储在云端。
3）存储权限
用途：用于保存和读取编程作品。
特别说明：您的编程作品存储在设备本地，不会被访问或上传。
4）蓝牙权限
用途：用于连接硬件设备，实现与硬件的互动操作。
特别说明：仅用于蓝牙设备连接和通信，蓝牙连接信息不被记录。
5）定位权限
用途：用于扫描 BLE 蓝牙设备（蓝牙低功耗模式所需）。
特别说明：本软件不会使用定位权限收集位置信息，仅用于技术要求的蓝牙扫描。

<b>二、我们如何保护您的信息</b>
2.1本地存储安全性
所有的用户数据均保存在您的设备本地，不会被上传至任何服务器或第三方平台。

2.2权限申请
我们仅申请与功能相关的必要权限，且会在权限使用时通过弹窗明确说明用途，并征得您的同意。

2.3信息隔离
本软件不会主动读取与功能无关的设备信息，更不会进行数据收集、数据分析或信息共享。

2.4蓝牙通信安全
蓝牙通信过程中，我们仅在您设备和硬件间传输数据，通信内容不会被记录或泄露。

<b>三、您的权利</b>
3.1权限管理
您可以随时通过设备的系统设置管理本软件的权限。如果您撤销授权，本软件某些功能可能会受到限制，但不影响您使用其他功能。

3.2数据安全
您对使用本软件过程中产生的所有数据（如照片、录音、编程作品等）拥有完全控制权。

<b>四、青少年用户特别提示</b>
如果您是未满18周岁的未成年人，请在您的监护人同意下使用本软件，并在监护人的指导下学习如何正确使用软件及保护个人隐私。

<b>五、隐私政策的更新</b>
为适应法律法规或服务调整，本隐私政策可能会不时更新。我们将不会另行通知。建议您定期查看本政策，以确保了解最新信息。

<b>六、联系我们</b>
如您对本隐私政策有任何疑问、意见或建议，请通过以下方式与我们联系：
公司名称：山东艾克瑞特教育科技有限公司
联系邮箱：icrobot@163.com
联系电话：400-075-7778`]


let enYHXY=['User Agreement',`Dear User,Welcome to ICQbot Programming Software (hereinafter referred to as "the Software") and related services. This agreement is jointly signed by the user (hereinafter referred to as "you" or "User") and Shandong I Create Robot Education Technology Co., Ltd. (hereinafter referred to as "I Create Robot" or "we"). Please read the following terms carefully before using the Software and services to ensure you fully understand and agree to the content of this agreement.

If you have any questions about the content of this agreement, please feel free to contact us at icrobot@163.com.

<b>I. Scope and Description of Services</b>
1.1 Content of Services
The Software aims to provide users with simple and fun programming tools and related hardware support services, including but not limited to:Code writing,Hardware interaction,Project management,Resource sharing, and Community interaction.

1.2 Applicable Scope
This agreement applies to the Software and all related services, including mobile applications, web-based tools, and all associated functions and hardware services related to ICQbot.

<b>II. User Rules</b>
2.1 User Conduct
While using the Software, users must comply with national laws, regulations, and social public ethics and refrain from engaging in any illegal, improper, or prohibited activities, including but not limited to:
Disseminating files containing malicious code, false information, or illegal content.
Conducting commercial advertising, harassment, or other unauthorized activities using the Software.
Violating applicable laws or regulations or infringing on the legitimate rights of third parties.

2.2 Software Restrictions
Users are prohibited from the following actions:
Reverse engineering, decompiling, or cracking the Software or its components.
Modifying, deleting, or concealing copyright notices and related prompts without authorization.
Copying, transferring, or distributing the Software or its content without permission.

2.3 User Responsibilities
Users shall bear sole responsibility for any disputes, compensation, fines, or other legal liabilities arising from violations or illegal activities, and shall compensate I Create Robot for any resulting losses.

<b>III. Privacy Protection and Data Security</b>
3.1 User Privacy Protection
We are committed to strictly protecting user privacy and will only collect and use your personal information within the necessary scope, including but not limited to:
Device Permissions: Camera, recording, read/write, Bluetooth, and location permissions are solely used to implement Software functions and not for other purposes.
Data Usage: Photos, audio, and works uploaded by users will only be used for local storage or Bluetooth transmission.

3.2 Data Security Measures
We ensure the security of user data through encrypted storage and transmission methods.
Without user authorization or legal requirements, I Create Robot will not disclose user data to any third party.

<b>IV. Intellectua l Property Rights</b>
4.1 Copyright and Trademarks
The Software and its related content (including but not limited to code, text, images, trademarks, and interface design) are owned by I Create Robot and its licensors.
Users shall not use or distribute any content of the Software without authorization. Unauthorized actions will be subject to legal consequences.

4.2 User Works Usage Rights
The intellectual property rights of works created by users through the Software belong to the users.
Users grant I Create Robot the right to use their non-confidential works for product optimization, functional testing, or promotional purposes while ensuring that private data is not disclosed.

<b>V. Disclaimer</b>
5.1 Service Risk Warning
The Software may temporarily become unavailable due to technical issues, third-party service interruptions, or force majeure events. I Create Robot shall not be liable for any direct or indirect losses caused by such events.
We are not responsible for data loss or hardware damage caused by user mishandling or device malfunction.

5.2 Third-Party Services
The Software may integrate third-party services (e.g., cloud storage, payment interfaces). Any issues or disputes related to these services should be resolved with the third party, and we are not liable for them.

<b>VI. Special Protection Provisions for Minors</b>
If the user is under the age of 18, they must use the Software under the supervision of a parent or legal guardian.
I Create Robot recommends that parents take reasonable measures to monitor minors' online behavior to prevent addiction or exposure to harmful information.

<b>VII. Modifications and Termination of the Agreement</b>
7.1 Agreement Modification
I Create Robot reserves the right to modify the terms of this agreement as necessary and without prior notice. If you disagree with the modifications, you should immediately stop using the services.

7.2 Service Termination
If the user violates this agreement or any applicable laws, we reserve the right to immediately terminate the service and pursue relevant responsibilities.

<b>VIII. Dispute Resolution and Applicable Laws</b>
This agreement shall be governed by the laws of the People's Republic of China.
Any disputes arising from this agreement shall first be resolved through amicable negotiation; if negotiation fails, either party may file a lawsuit with the court located in the jurisdiction of I Create Robot.

<b>IX. Contact Us</b>
Company Name: Shandong I Create Robot Education Technology Co., Ltd.
Email: icrobot@163.com
Phone Number: 400-075-7778

This agreement takes effect immediately. Thank you for your support and trust in ICQbot Programming Software!`]
let enYSZC=['Privacy Policy',`Dear Users,Thank you for using the ICQbot software (hereinafter referred to as "the Software"). We highly value your privacy and are committed to protecting your personal information and privacy. This Privacy Policy explains how we collect, use, and protect your information during your use of the Software.

<b>I. How We Collect and Use Information</b>
The Software does not require a registration process and does not upload any of your personal information to servers. While using the Software, you only need to authorize the following device permissions to ensure the proper operation of relevant functions:

Camera Permission
Purpose: To take photos of the added characters.
Special Note: Photos are stored locally on your device and will not be uploaded or shared.

Microphone Permission
Purpose: To record audio for adding sound effects to characters.
Special Note: Recorded audio is only stored and played locally and will not be uploaded or saved in the cloud.

Storage Permission
Purpose: To save and read programming projects.
Special Note: Your programming projects are stored locally on your device and will not be accessed or uploaded.

Bluetooth Permission
Purpose: To connect to hardware devices and enable interactive operations.
Special Note: Only used for Bluetooth device connections and communication; no Bluetooth connection information is recorded.

Location Permission
Purpose: Required for scanning BLE (Bluetooth Low Energy) devices.
Special Note: The Software does not use location permissions to collect location information but only for the technical requirement of Bluetooth scanning.

<b>II. How We Protect Your Information</b>
2.1 Local Storage Security
All user data is stored locally on your device and will not be uploaded to any server or third-party platform.

2.2 Permission Requests
We only request permissions necessary for the Software's functions and will clearly explain their purposes through pop-up notifications at the time of use and obtain your consent.

2.3 Information Isolation
The Software will not actively read device information unrelated to its functions, nor will it engage in data collection, analysis, or information sharing.

2.4 Bluetooth Communication Security
During Bluetooth communication, data is transmitted only between your device and the hardware. Communication content is not recorded or disclosed.

<b>III. Your Rights</b>
3.1 Permission Management
You can manage the Software's permissions at any time through your device's system settings. If you revoke authorization, certain functions of the Software may be restricted, but it will not affect your use of other features.

3.2 Data Security
You have full control over all data generated during your use of the Software (such as photos, recordings, programming projects, etc.).

<b>IV. Special Note for Juvenile Users</b>
If you are under 18 years old, please use the Software with the consent of your guardian and under their guidance to learn how to use th e Software properly and protect your privacy.

<b>V. Updates to the Privacy Policy</b>
This Privacy Policy may be updated periodically to comply with legal regulations or service adjustments. We will not provide separate notifications for updates. It is recommended that you regularly review this policy to stay informed of the latest information.

<b>VI. Contact Us</b>
If you have any questions, comments, or suggestions about this Privacy Policy, please contact us via the following methods:

Company Name: Shandong I Create Robot Education Technology Co., Ltd.
Email: icrobot@163.com
Phone Number: 400-075-7778`]