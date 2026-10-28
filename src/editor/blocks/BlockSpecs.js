import Localization from '../../utils/Localization';
import IO from '../../iPad/IO';

let loadCount = 0;

let loadassets = {};
let fontwhite = '#f2f3f2';
let fontpink = '#ff8ae9';
let fontdarkgray = '#6d6e6c';
let fontblack = '#1b2a34';
let fontyellow = '#ffdd33';
let fontdarkgreen = '#287f46';
let fontpurple = '#8f56e3';
let fontblue = '#0d50ab';
let fontred = '#c4281b';
let fontorange = '#da8540';

let fontcolors = [fontred, fontorange, fontyellow,
    fontdarkgreen, fontblue, fontpink, fontpurple,
    fontwhite, fontdarkgray, fontblack];

let fontsizes = [16, 24, 36, 48, 56, 72];

let getshapes = ['LetterGet_Orange', 'LetterGet_Red', 'LetterGet_Yellow', 'LetterGet_Green',
    'LetterGet_Blue', 'LetterGet_Purple'];
let sendshapes = ['LetterSend_Orange', 'LetterSend_Red', 'LetterSend_Yellow', 'LetterSend_Green',
    'LetterSend_Blue', 'LetterSend_Purple'];

let speeds = ['speed0', 'speed1', 'speed2'];



//var getMspeed  = ['motor-speed1'];//马达速度图片
var getMclock  = ['motor-clockwise3','motor-clockwise4'];//马达顺时针转动图片  ,"wedo电机","wedo电机02"
var getMcounterclock  = ['motor-counterclockwise3','motor-counterclockwise4'];//马达逆时针转动图片
var getMstop = ['motor-stop3','motor-stop4'];//马达停止转动图片

var getM3  = ['motor-clockwise3','motor-counterclockwise3','motor-stop3'];//马达3转动图片  
var getM4  = ['motor-clockwise4','motor-counterclockwise4','motor-stop4'];//马达4转动图片  


var getLed=['led-white1','led-red2','led-orange3','led-yellow4','led-green5','led-cyan6','led-blue7','led-purple8','led-black0'];//led灯图片

var gettilt  = ['tilt-f','tilt-b', 'tilt-l', 'tilt-r','tilt-level','tilt-shak'];//倾斜传感器图片   ,"wedo光电","wedo倾斜","wedo倾斜1"
var getLightDist=['light-n','light-m','light-f','light-b1','light-b2','light-w1','light-w2'];//光电-距离图片
var getLightB=['light-b1','light-b2'];//光电-黑图片
var getLightW=['light-w1','light-w2'];//光电-c

var getButton=['button-1','button-2'];//按钮图片
var getVoice_l=['voiceL-1','voiceL-2','voiceL-3','voiceL-4','voiceL-5','voiceL-6'];//语音-自学习图片
var getVoice=['victory_r','victory_l','victory_up','victory_dw','victory_rr','victory_ll','victory_j','victory_s','victory_sp','voiceL-1','voiceL-2','voiceL-3'];//语音-图片,'voiceL-4','voiceL-5','voiceL-6'

var getAnimal=['dog.mp3','cock.mp3','tiger.mp3','horse.mp3','cow.mp3','sheep.mp3','cat.mp3','bird.mp3','pig.mp3'];//播放动物语音-图片[狗 公鸡 老虎 马 牛 羊 猫 鸟 猪]
var getCar=['car.mp3','train.mp3','police.mp3','ambulance.mp3','fireEngine.mp3','bicycle.mp3'];//播放汽车语音-图片[汽车 火车 警车 救护车 消防车 自行车]
var getOther=['victory.mp3','failure.mp3','wowu~.mp3','alarm.mp3','gunfire.mp3','hit.mp3'];//播放其他语音-图片[胜利 失败 喔呜 警报 枪 击打]

var getFace=['face-wx','face-zz', 'face-zy', 'face-dz','face-tm'];//ai模型-人连
var getHand=['hand-b','hand-qt','hand-jd'];//ai模型-首饰
var getPose=['pose-zs','pose-ys','pose-ss','pose-fx'];//ai模型-姿态


export default class BlockSpecs {
    static get loadCount () {
        return loadCount;
    }

    static set loadCount (newLoadCount) {
        loadCount = newLoadCount;
    }

    static get fontcolors () {
        return fontcolors;
    }

    static get fontsizes () {
        return fontsizes;
    }

    static get speeds () {
        return speeds;
    }

    static initBlocks () {
        loadassets = new Object();
        BlockSpecs.loadGraphics();
        BlockSpecs.defs = BlockSpecs.setupBlocksSpecs();
        BlockSpecs.palettes = BlockSpecs.setupPalettesDef();
        BlockSpecs.categories = BlockSpecs.setupCategories();
        if (window.Settings.edition == 'PBS') {
            BlockSpecs.canvasMask = BlockSpecs.getImageFrom('assets/ui/canvasmask', 'svg');
        } else {
            BlockSpecs.canvasMask = BlockSpecs.getImageFrom('assets/ui/canvasmask');
        }
        if (window.Settings.edition != 'PBS') {
            BlockSpecs.projectThumb = BlockSpecs.getImageFrom('assets/lobby/pmask');
        }
        IO.requestFromServer('assets/balloon.svg', BlockSpecs.setBalloon);
        loadCount++;
    }

    static setBalloon (str) {
        loadCount--;
        BlockSpecs.balloon = str;
    }


    static loadGraphics () {
        BlockSpecs.mic = BlockSpecs.getImageFrom('assets/ui/recordslot', 'svg');
        BlockSpecs.yellowStart = BlockSpecs.getImageFrom('assets/blocks/start', 'svg');
        BlockSpecs.yellowStartH = BlockSpecs.getImageFrom('assets/blocks/eh/startH');

        BlockSpecs.yellowCmd = BlockSpecs.getImageFrom('assets/blocks/yellowCmd', 'svg');
        BlockSpecs.yellowCmdH = BlockSpecs.getImageFrom('assets/blocks/eh/yellowCmdH');

        BlockSpecs.redEnd = BlockSpecs.getImageFrom('assets/blocks/endshort', 'svg');
        BlockSpecs.redEndH = BlockSpecs.getImageFrom('assets/blocks/eh/stopH');

        BlockSpecs.orangeCmd = BlockSpecs.getImageFrom('assets/blocks/flow', 'svg');
        BlockSpecs.orangeCmdH = BlockSpecs.getImageFrom('assets/blocks/eh/flowH');

        BlockSpecs.limeCmd = BlockSpecs.getImageFrom('assets/blocks/sounds', 'svg');
        BlockSpecs.limeCmdH = BlockSpecs.getImageFrom('assets/blocks/eh/soundsH');

        BlockSpecs.pinkCmd = BlockSpecs.getImageFrom('assets/blocks/looks', 'svg');
        BlockSpecs.pinkCmdH = BlockSpecs.getImageFrom('assets/blocks/eh/looksH');

        BlockSpecs.redEndLong = BlockSpecs.getImageFrom('assets/blocks/endlong', 'svg');
        BlockSpecs.redEndLongH = BlockSpecs.getImageFrom('assets/blocks/eh/stoplongH');

        BlockSpecs.cShape = BlockSpecs.getImageFrom('assets/blocks/repeat');
        BlockSpecs.cShapeH = BlockSpecs.getImageFrom('assets/blocks/eh/repeatH');

        BlockSpecs.blueCmd = BlockSpecs.getImageFrom('assets/blocks/blueCmd', 'svg');
        BlockSpecs.blueCmdH = BlockSpecs.getImageFrom('assets/blocks/eh/blueCmdH');

        BlockSpecs.greenCmd = BlockSpecs.getImageFrom('assets/blocks/greenCmd', 'svg');
        BlockSpecs.greenCmdH = BlockSpecs.getImageFrom('assets/blocks/eh/greenCmdH');

        BlockSpecs.textfieldimg = BlockSpecs.getImageFrom('assets/misc/Text-01');
        BlockSpecs.numfieldimg = BlockSpecs.getImageFrom('assets/misc/Number-01');
        BlockSpecs.pressbutton = BlockSpecs.getImageFrom('assets/misc/pushbutton-01', 'svg');
        BlockSpecs.pressbuttonSmall = BlockSpecs.getImageFrom('assets/misc/pushbutton', 'svg');
        BlockSpecs.caretrepeat = BlockSpecs.getImageFrom('assets/blocks/caretrepeat');
        BlockSpecs.cmdS = BlockSpecs.getImageFrom('assets/blocks/shadowCmd', 'svg');
        BlockSpecs.startS = BlockSpecs.getImageFrom('assets/blocks/shadowStart', 'svg');
        BlockSpecs.endS = BlockSpecs.getImageFrom('assets/blocks/shadowEndShort', 'svg');
        BlockSpecs.endLongS = BlockSpecs.getImageFrom('assets/blocks/shadowEndLong', 'svg');
        BlockSpecs.repeatS = BlockSpecs.getImageFrom('assets/blocks/shadowRepeat');

        BlockSpecs.pressbuttonSmall_pink = BlockSpecs.getImageFrom('assets/misc/pushbutton_pink', 'svg');//粉色下拉按钮
        BlockSpecs.pressbutton_pink = BlockSpecs.getImageFrom('assets/misc/pushbutton_pink-01', 'svg');

        BlockSpecs.pressbuttonSmall_green = BlockSpecs.getImageFrom('assets/misc/pushbutton_green', 'svg');//绿色下拉按钮
        BlockSpecs.pressbutton_green = BlockSpecs.getImageFrom('assets/misc/pushbutton_green-01', 'svg');

        BlockSpecs.pressbuttonSmall_greenS = BlockSpecs.getImageFrom('assets/misc/pushbutton_greenS', 'svg');//声音绿色下拉按钮
        BlockSpecs.pressbutton_greenS = BlockSpecs.getImageFrom('assets/misc/pushbutton_greenS-01', 'svg');

    }

    static getImageFrom (url, ext) {
        var img = document.createElement('img');
        img.src = url + (ext ? '.' + ext : '.png');
        if (!img.complete) {
            loadassets[img.src] = img;
            loadCount++;
            img.onload = function () {
                delete loadassets[img.src];
                loadCount--;
            };
        }
        return img;
    }


    static refreshLoading () {
        for (var key in loadassets) {
            if (loadassets[key].complete) {
                loadCount--;
            }
        }
    }

    static setupCategories () {//设置类别
        return new Array(
            [
                BlockSpecs.getImageFrom('assets/categories/StartOn', 'svg'),
                BlockSpecs.getImageFrom('assets/categories/StartOff', 'svg'),
                window.Settings.categoryStartColor
            ],
            /*[
                BlockSpecs.getImageFrom('assets/categories/RobotStartOn', 'svg'),
                BlockSpecs.getImageFrom('assets/categories/RobotStartOff', 'svg'),
                window.Settings.categoryStartColor
            ],*/
            [
                BlockSpecs.getImageFrom('assets/categories/MotionOn', 'svg'),
                BlockSpecs.getImageFrom('assets/categories/MotionOff', 'svg'),
                window.Settings.categoryMotionColor
            ],
            [
                BlockSpecs.getImageFrom('assets/categories/LooksOn', 'svg'),
                BlockSpecs.getImageFrom('assets/categories/LooksOff', 'svg'),
                window.Settings.categoryLooksColor
            ],
            [
                BlockSpecs.getImageFrom('assets/categories/SoundOn', 'svg'),
                BlockSpecs.getImageFrom('assets/categories/SoundOff', 'svg'),
                window.Settings.categorySoundColor
            ],
            [
                BlockSpecs.getImageFrom('assets/categories/FlowOn', 'svg'),
                BlockSpecs.getImageFrom('assets/categories/FlowOff', 'svg'),
                window.Settings.categoryFlowColor
            ],
            [
               BlockSpecs.getImageFrom('assets/categories/RobotOn', 'svg'),
               BlockSpecs.getImageFrom('assets/categories/RobotOff', 'svg'),
               window.Settings.categoryRobotColor
             ],
            [
                BlockSpecs.getImageFrom('assets/categories/StopOn', 'svg'),
                BlockSpecs.getImageFrom('assets/categories/StopOff', 'svg'),
                window.Settings.categoryStopColor
            ]

        );
    }


    static setupPalettesDef () {
        return [['onflag', 'onclick', 'ontouch', 'onmessage', 'message',"ontilt","onlightD" ,"onbutt","onaiFace","onaiHand","onaiPose"],
            /*["ontilt", "onlightD" ,"onlightB","onlightW","onbutt","onvoiceL","onvoice"],*/
            ['forward', 'back', 'up', 'down', 'right', 'left', 'hop', 'home'],
            ['say', 'space', 'grow', 'shrink', 'same', 'space', 'hide', 'show','space','led'],
            ["onvoice",'animal','car','other'],
            ['wait', 'stopmine', 'setspeed', 'repeat'],
            /*['robot_forward','robot_back','robot_left','robot_right'],*/
            ['motor_speed','motor_clockwise','motor_counterclockwise','motor_forward','motor_backward','motor_left','motor_right','motor_stopP'],
            ['endstack', 'forever'],
            ];
    }

    ///////////////////////////////
    // Data Structure
    //
    // name - blocktype, icon or datastructure, blockshape, argtype, initial value, highlight, min, max, shadow
    //
    // arg types:
    // null
    // n -> number field;
    // t -> text field
    // m  --> image menu with argvalue equal to name;
    // d --> image menu with argvalue equal to number;
    // c -- > color drop down
    // s --> sound name
    // p --> page icon

    //数据结构
    //名称-块类型，图标或数据结构，块形状，argtype，初始值，高亮，最小值，最大值，阴影
    //
    ////////////////////////////////

    static setupBlocksSpecs () {
        return {
            'onflag': ['onflag', BlockSpecs.getImageFrom('assets/blockicons/greenFlag', 'svg'),
                BlockSpecs.yellowStart, null, null, BlockSpecs.yellowStartH, null, null, BlockSpecs.startS],
            'onmessage': ['onmessage', getshapes, BlockSpecs.yellowStart, 'm', 'Orange',
                BlockSpecs.yellowStartH, null, null, BlockSpecs.startS],
            'onclick': ['onclick', BlockSpecs.getImageFrom('assets/blockicons/OnTouch', 'svg'),
                BlockSpecs.yellowStart, null, null, BlockSpecs.yellowStartH, null, null, BlockSpecs.startS],
            'ontouch': ['ontouch', BlockSpecs.getImageFrom('assets/blockicons/Bump', 'svg'),
                BlockSpecs.yellowStart, null, null, BlockSpecs.yellowStartH, null, null, BlockSpecs.startS],
            'message': ['message', sendshapes, BlockSpecs.yellowCmd, 'm', 'Orange',
                BlockSpecs.yellowCmdH, null, null, BlockSpecs.cmdS],

            'repeat': ['repeat', BlockSpecs.getImageFrom('assets/blockicons/Repeat', 'svg'),
                BlockSpecs.cShape, 'n', 4, BlockSpecs.cShapeH, 0, 24, BlockSpecs.repeatS],

            'forward': ['forward', BlockSpecs.getImageFrom('assets/blockicons/Foward', 'svg'),
                BlockSpecs.blueCmd, 'n', 1, BlockSpecs.blueCmdH, -20, 20, BlockSpecs.cmdS],
            'back': ['back', BlockSpecs.getImageFrom('assets/blockicons/Back', 'svg'),
                BlockSpecs.blueCmd, 'n', 1, BlockSpecs.blueCmdH, -20, 20, BlockSpecs.cmdS],
            'up': ['up', BlockSpecs.getImageFrom('assets/blockicons/Up', 'svg'),
                BlockSpecs.blueCmd, 'n', 1, BlockSpecs.blueCmdH, -15, 15, BlockSpecs.cmdS],
            'down': ['down', BlockSpecs.getImageFrom('assets/blockicons/Down', 'svg'),
                BlockSpecs.blueCmd, 'n', 1, BlockSpecs.blueCmdH, -15, 15, BlockSpecs.cmdS],
            'right': ['right', BlockSpecs.getImageFrom('assets/blockicons/Right', 'svg'),
                BlockSpecs.blueCmd, 'n', 1, BlockSpecs.blueCmdH, -12, 12, BlockSpecs.cmdS],
            'left': ['left', BlockSpecs.getImageFrom('assets/blockicons/Left', 'svg'),
                BlockSpecs.blueCmd, 'n', 1, BlockSpecs.blueCmdH, -12, 12, BlockSpecs.cmdS],
            'home': ['home', BlockSpecs.getImageFrom('assets/blockicons/Home', 'svg'),
                BlockSpecs.blueCmd, null, null, BlockSpecs.blueCmdH, null, null, BlockSpecs.cmdS],
            'hop': ['hop', BlockSpecs.getImageFrom('assets/blockicons/Hop', 'svg'),
                BlockSpecs.blueCmd, 'n', 2, BlockSpecs.blueCmdH, -15, 15, BlockSpecs.cmdS],


            'wait': ['wait', BlockSpecs.getImageFrom('assets/blockicons/Wait', 'svg'),
                BlockSpecs.orangeCmd, 'n', 10, BlockSpecs.orangeCmdH, 0, 50, BlockSpecs.cmdS],
            'setspeed': ['setspeed', speeds, BlockSpecs.orangeCmd, 'd', 1,
                BlockSpecs.orangeCmdH, null, null, BlockSpecs.cmdS],
            'stopmine': ['stopmine', BlockSpecs.getImageFrom('assets/blockicons/Stop', 'svg'),
                BlockSpecs.orangeCmd, null, null, BlockSpecs.orangeCmdH, null, null, BlockSpecs.cmdS],

            'say': ['say', BlockSpecs.getImageFrom('assets/blockicons/Say', 'svg'),
                BlockSpecs.pinkCmd, 't',
                Localization.localize('SAY_BLOCK_DEFAULT_ARGUMENT'), BlockSpecs.pinkCmdH, null, null, BlockSpecs.cmdS],
            'show': ['show', BlockSpecs.getImageFrom('assets/blockicons/Appear', 'svg'),
                BlockSpecs.pinkCmd, null, null, BlockSpecs.pinkCmdH, null, null, BlockSpecs.cmdS],
            'hide': ['hide', BlockSpecs.getImageFrom('assets/blockicons/Disappear', 'svg'),
                BlockSpecs.pinkCmd, null, null, BlockSpecs.pinkCmdH, null, null, BlockSpecs.cmdS],
            'grow': ['grow', BlockSpecs.getImageFrom('assets/blockicons/Grow', 'svg'),
                BlockSpecs.pinkCmd, 'n', 2, BlockSpecs.pinkCmdH, -10, 10, BlockSpecs.cmdS],
            'shrink': ['shrink', BlockSpecs.getImageFrom('assets/blockicons/Shrink', 'svg'),
                BlockSpecs.pinkCmd, 'n', 2, BlockSpecs.pinkCmdH, -10, 10, BlockSpecs.cmdS],
            'same': ['same', BlockSpecs.getImageFrom('assets/blockicons/Reset', 'svg'),
                BlockSpecs.pinkCmd, null, null, BlockSpecs.pinkCmdH, null, null, BlockSpecs.cmdS],

            'playsnd': ['playsnd', BlockSpecs.getImageFrom('assets/blockicons/Speaker', 'svg'),
                BlockSpecs.limeCmd, 's', 'pop.mp3', BlockSpecs.limeCmdH, null, null, BlockSpecs.cmdS],
            'playusersnd': ['playusersnd', BlockSpecs.getImageFrom('assets/blockicons/Microphone', 'svg'),
                BlockSpecs.limeCmd, 'r', '1', BlockSpecs.limeCmdH, null, null, BlockSpecs.cmdS],
            'endstack': ['endstack', null, BlockSpecs.redEnd, null, null,
                BlockSpecs.redEndH, null, null, BlockSpecs.endS],
            'forever': ['forever', BlockSpecs.getImageFrom('assets/blockicons/Forever', 'svg'),
                BlockSpecs.redEnd, null, null, BlockSpecs.redEndH, null, null, BlockSpecs.endS],
            'gotopage': ['gotopage', null,
                BlockSpecs.redEndLong, 'p', '2', BlockSpecs.redEndLongH, null, null, BlockSpecs.endLongS],
            'caretstart': ['caretstart', null,
                BlockSpecs.getImageFrom('assets/blocks/caretstart', 'svg'), null, null, null, null, null],
            'caretend': ['caretend', null,
                BlockSpecs.getImageFrom('assets/blocks/caretend', 'svg'), null, null, null, null, null],
            'caretrepeat': ['caretrepeat', null,
                BlockSpecs.getImageFrom('assets/blocks/caretrepeat'), null, null, null, null, null],
            'caretcmd': ['caretcmd', null,
                BlockSpecs.getImageFrom('assets/blocks/caretcmd', 'svg'), null, null, null, null, null],

            //Robot section start
                'robot_forward': ['robot_forward', BlockSpecs.getImageFrom('assets/blockicons/Robot_Forward', 'svg'),
                      BlockSpecs.greenCmd, 'n', 1, BlockSpecs.greenCmdH, 1, null, BlockSpecs.cmdS],
                'robot_back': ['robot_back', BlockSpecs.getImageFrom('assets/blockicons/Robot_Back', 'svg'),
                      BlockSpecs.greenCmd, 'n', 1, BlockSpecs.greenCmdH, 1, null, BlockSpecs.cmdS],
                'robot_left':['robot_left', BlockSpecs.getImageFrom('assets/blockicons/Robot_Left', 'svg'),
                      BlockSpecs.greenCmd, 'n', 1, BlockSpecs.greenCmdH, 1, null, BlockSpecs.cmdS],
                'robot_right':['robot_right', BlockSpecs.getImageFrom('assets/blockicons/Robot_Right', 'svg'),
                            BlockSpecs.greenCmd, 'n', 1, BlockSpecs.greenCmdH, 1, null, BlockSpecs.cmdS],


            'motor_speed': ['motor_speed', BlockSpecs.getImageFrom('assets/blockicons/motor-speed', 'svg'),BlockSpecs.greenCmd, 'n', 5, BlockSpecs.greenCmdH, 1, 9, BlockSpecs.cmdS],
            'motor_clockwise': ['motor_clockwise', getM3,BlockSpecs.greenCmd, 'm', "motor-clockwise3", BlockSpecs.greenCmdH, null,null, BlockSpecs.cmdS],
            'motor_counterclockwise': ['motor_counterclockwise', getM4,BlockSpecs.greenCmd, 'm', "motor-clockwise4", BlockSpecs.greenCmdH, null,null, BlockSpecs.cmdS],
            //'motor_stop': ['motor_stop', getMstop,BlockSpecs.greenCmd, 'm', "motor-stop3", BlockSpecs.greenCmdH, null,null, BlockSpecs.cmdS],
            'motor_forward': ['motor_forward', BlockSpecs.getImageFrom('assets/blockicons/motor_forward', 'svg'),BlockSpecs.greenCmd, null, "motor_forward", BlockSpecs.greenCmdH, null, null, BlockSpecs.cmdS],
            'motor_backward': ['motor_backward', BlockSpecs.getImageFrom('assets/blockicons/motor_backward', 'svg'),BlockSpecs.greenCmd, null, 'motor_backward', BlockSpecs.greenCmdH, null, null, BlockSpecs.cmdS],
            'motor_left': ['motor_left', BlockSpecs.getImageFrom('assets/blockicons/motor_left', 'svg'),BlockSpecs.greenCmd, null, 'motor_left', BlockSpecs.greenCmdH, null, null, BlockSpecs.cmdS],
            'motor_right': ['motor_right', BlockSpecs.getImageFrom('assets/blockicons/motor_right', 'svg'),BlockSpecs.greenCmd, null, 'motor_right', BlockSpecs.greenCmdH, null, null, BlockSpecs.cmdS],
            'motor_stopP': ['motor_stopP', BlockSpecs.getImageFrom('assets/blockicons/motor_stopP', 'svg'),BlockSpecs.greenCmd, null, 'motor_stopP', BlockSpecs.greenCmdH, null, null, BlockSpecs.cmdS],

            'led': ['led', getLed,BlockSpecs.pinkCmd, 'm', "led-white1", BlockSpecs.pinkCmdH, null,null, BlockSpecs.cmdS],

            
            'animal': ['animal', getAnimal, BlockSpecs.limeCmd, 'm', 'dog.mp3', BlockSpecs.limeCmdH, null, null, BlockSpecs.cmdS],
            'car': ['car', getCar, BlockSpecs.limeCmd, 'm', 'car.mp3', BlockSpecs.limeCmdH, null, null, BlockSpecs.cmdS],
            'other': ['other', getOther, BlockSpecs.limeCmd, 'm', 'victory.mp3', BlockSpecs.limeCmdH, null, null, BlockSpecs.cmdS],
            

            'onbutt': ['onbutt', getButton, BlockSpecs.yellowStart, 'm', 'button-1', BlockSpecs.yellowStartH, null, null, BlockSpecs.startS],
            
            'onvoice': ['onvoice', getVoice, BlockSpecs.yellowStart, 'm', 'r', BlockSpecs.yellowStartH, null, null, BlockSpecs.startS],

            'ontilt': ['ontilt', gettilt, BlockSpecs.yellowStart, 'm', 'tilt-f', BlockSpecs.yellowStartH, null, null, BlockSpecs.startS],
            'onlightD': ['onlightD', getLightDist, BlockSpecs.yellowStart, 'm', 'light-n',BlockSpecs.yellowStartH, null, null, BlockSpecs.startS],

            'onaiFace': ['onaiFace', getFace, BlockSpecs.yellowStart, 'm', 'face-wx', BlockSpecs.yellowStartH, null, null, BlockSpecs.startS],
            'onaiHand': ['onaiHand', getHand, BlockSpecs.yellowStart, 'm', 'hand-b', BlockSpecs.yellowStartH, null, null, BlockSpecs.startS],
            'onaiPose': ['onaiPose', getPose, BlockSpecs.yellowStart, 'm', 'pose-zs', BlockSpecs.yellowStartH, null, null, BlockSpecs.startS]

            /*'onlightB': ['onlightB', getLightB, BlockSpecs.yellowStart, 'm', 'light-b1',BlockSpecs.yellowStartH, null, null, BlockSpecs.startS],
            'onlightW': ['onlightW', getLightW, BlockSpecs.yellowStart, 'm', 'light-w1',BlockSpecs.yellowStartH, null, null, BlockSpecs.startS]*/

            //Robot section end
        };
    }

//翻译
    static blockDesc (b, spr) {
        var str = b.getArgValue() ? b.getArgValue().toString() : (b.blocktype == 'playsnd') ? 'SOUND' : '';

        return {
            'onflag': Localization.localize('BLOCK_DESC_GREEN_FLAG'),
            'onclick': Localization.localize('BLOCK_DESC_ON_TAP', {
                CHARACTER_NAME: spr.name
            }),
            'ontouch': Localization.localize('BLOCK_DESC_ON_BUMP', {
                CHARACTER_NAME: spr.name ? spr.name : ''
            }),
            'onmessage': Localization.localize('BLOCK_DESC_ON_MESSAGE', {
                COLOR: Localization.localize('BLOCK_DESC_MESSAGE_COLOR_ORANGE')
            }),
            'repeat': Localization.localize('BLOCK_DESC_REPEAT'),
            'forward': Localization.localize('BLOCK_DESC_MOVE_RIGHT'),
            'back': Localization.localize('BLOCK_DESC_MOVE_LEFT'),
            'up': Localization.localize('BLOCK_DESC_MOVE_UP'),
            'down': Localization.localize('BLOCK_DESC_MOVE_DOWN'),
            'home': Localization.localize('BLOCK_DESC_GO_HOME'),
            'left': Localization.localize('BLOCK_DESC_TURN_LEFT'),
            'right': Localization.localize('BLOCK_DESC_TURN_RIGHT'),
            'hop': Localization.localize('BLOCK_DESC_HOP'),
            'wait': Localization.localize('BLOCK_DESC_WAIT'),
            'setspeed': Localization.localize('BLOCK_DESC_SET_SPEED'),
            'stopmine': Localization.localize('BLOCK_DESC_STOP', {
                CHARACTER_NAME: spr.name ? spr.name : spr.str
            }),
            'say': Localization.localize('BLOCK_DESC_SAY'),
            'show': Localization.localize('BLOCK_DESC_SHOW'),
            'hide': Localization.localize('BLOCK_DESC_HIDE'),
            'grow': Localization.localize('BLOCK_DESC_GROW'),
            'shrink': Localization.localize('BLOCK_DESC_SHRINK'),
            'same': Localization.localize('BLOCK_DESC_RESET_SIZE'),
            'playsnd': Localization.localize('BLOCK_DESC_PLAY_SOUND', {
                SOUND_NAME: Localization.localize('BLOCK_DESC_PLAY_SOUND_POP')
            }),
            'playusersnd': Localization.localize('BLOCK_DESC_PLAY_RECORDED_SOUND'),
            'endstack': Localization.localize('BLOCK_DESC_END'),
            'stopall': Localization.localize('BLOCK_DESC_STOP', {
                CHARACTER_NAME: spr.name ? spr.name : ''
            }),
            'forever': Localization.localize('BLOCK_DESC_REPEAT_FOREVER'),
            'gotopage': Localization.localize('BLOCK_DESC_GO_TO_PAGE', {
                PAGE: str
            }),
            'message': Localization.localize('BLOCK_DESC_SEND_MESSAGE', {
                COLOR: Localization.localize('BLOCK_DESC_MESSAGE_COLOR_ORANGE')
            }),



            'ontilt': Localization.localize('BLOCK_TILT_F'),
            'onlightD': Localization.localize('BLOCK_LIGHT_J'),
            'onbutt': Localization.localize('BLOCK_BUTTON_O'),
            'onvoice': Localization.localize('BLOCK_VOICE_R'),
            'led': Localization.localize('BLOCK_LED_W'),
            'animal': Localization.localize('BLOCK_ANIMAL_DOG'),
            'car': Localization.localize('BLOCK_CAR_CAR'),
            'other': Localization.localize('BLOCK_OTHER_WOO'),

            'onaiFace': Localization.localize('BLOCK_FACE_WX'),

            

            'motor_speed': Localization.localize('BLOCK_MOTOR_SPEED'),
            'motor_clockwise': Localization.localize('BLOCK_MOTOR_O'),
            'motor_counterclockwise': Localization.localize('BLOCK_MOTOR_T'),
            'motor_forward': Localization.localize('BLOCK_MOTOR_F'),
            'motor_backward': Localization.localize('BLOCK_MOTOR_B'),
            'motor_left': Localization.localize('BLOCK_MOTOR_L'),
            'motor_right': Localization.localize('BLOCK_MOTOR_R'),
            'motor_stopP': Localization.localize('BLOCK_MOTOR_STOP')
        };
    }
}

