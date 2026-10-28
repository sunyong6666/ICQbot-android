import ScratchJr from '../ScratchJr';
import ScratchAudio from '../../utils/ScratchAudio';
import Grid from '../ui/Grid';
import Vector from '../../geom/Vector';
import {gn} from '../../utils/lib';
import Robot from './Robot'
import Cookie from '../../utils/Cookie';

let tinterval = 1;
let hopList = [-48, -30, -22, -14, -6, 0, 6, 14, 22, 30, 48];
window.tilt_data=["",""];//倾斜传感器读取到的数值  端口--值

window.light_data1=["",""];//光电1读取到的数值  端口--值
window.light_data2=["",""];//光电2读取到的数值  端口--值

window.button_data1=["",""];//按钮1读取到的数值  端口--值
window.button_data2=["",""];//按钮2读取到的数值  端口--值

window.voice_data=["",""];//语音读取到的数值  端口--值

window.port1="";//端口1
window.port2="";//端口2


//ai相关数据
window.face_data=[0,0,0,0,0];//微笑，张嘴，眨眼，嘟嘴，抬眉
window.hand_data=[0,0,0,0];//左右手，剪刀，石头，布
window.pose_data=[0,0,0,0];//放下，左，右，双

window.aiMode="";//当前所处模式（用于开启模型）


export default class Prims {
    static get hopList () {
        return hopList;
    }

    static init () {
        Prims.table = {};
        Prims.table.done = Prims.Done;
        Prims.table.missing = Prims.Ignore;
        Prims.table.onflag = Prims.Ignore;
        Prims.table.onmessage = Prims.Ignore;
        Prims.table.onclick = Prims.Ignore;
        Prims.table.ontouch = Prims.OnTouch;
        Prims.table.onchat = Prims.Ignore;
        Prims.table.repeat = Prims.Repeat;
        Prims.table.forward = Prims.Forward;
        Prims.table.back = Prims.Back;
        Prims.table.up = Prims.Up;
        Prims.table.down = Prims.Down;
        Prims.table.left = Prims.Left;
        Prims.table.right = Prims.Right;
        Prims.table.home = Prims.Home;
        Prims.table.setspeed = Prims.SetSpeed;
        Prims.table.message = Prims.Message;
        Prims.table.setcolor = Prims.SetColor;
        Prims.table.bigger = Prims.Bigger;
        Prims.table.smaller = Prims.Smaller;
        Prims.table.wait = Prims.Wait;
        Prims.table.caretcmd = Prims.Ignore;
        Prims.table.caretstart = Prims.Ignore;
        Prims.table.caretend = Prims.Ignore;
        Prims.table.caretrepeat = Prims.Ignore;
        Prims.table.gotopage = Prims.GotoPage;
        Prims.table.endstack = Prims.DoNextBlock;
        Prims.table.stopall = Prims.StopAll;
        Prims.table.stopmine = Prims.StopMine;
        Prims.table.forever = Prims.Forever;
        Prims.table.hop = Prims.Hop;
        Prims.table.show = Prims.Show;
        Prims.table.hide = Prims.Hide;
        Prims.table.playsnd = Prims.playSound;
        Prims.table.playusersnd = Prims.playSound;
        Prims.table.grow = Prims.Grow;
        Prims.table.shrink = Prims.Shrink;
        Prims.table.same = Prims.Same;
        Prims.table.say = Prims.Say;

      /*  Prims.table.robot_forward = Prims.Robot_forward;
        Prims.table.robot_back = Prims.Robot_back;
        Prims.table.robot_up = Prims.Robot_up;
        Prims.table.robot_down = Prims.Robot_down; */

         Prims.table.robot_forward = Robot.Robot_forward;
         Prims.table.robot_back = Robot.Robot_back;
         Prims.table.robot_left = Robot.Robot_left;
         Prims.table.robot_right = Robot.Robot_right;


        Prims.table.motor_speed = Robot.motor_speed;
        Prims.table.motor_clockwise = Robot.set_motors;
        Prims.table.motor_counterclockwise = Robot.set_motors;
        Prims.table.motor_stop = Robot.set_motors;
        Prims.table.motor_forward = Robot.motor_forward;
        Prims.table.motor_backward = Robot.motor_backward;
        Prims.table.motor_left = Robot.motor_left;
        Prims.table.motor_right = Robot.motor_right;
        Prims.table.motor_stopP = Robot.motor_stopP;

        Prims.table.led = Robot.set_led;

        Prims.table.animal = Prims.playSound;
        Prims.table.car = Prims.playSound;
        Prims.table.other = Prims.playSound;



        Prims.table.ontilt = Prims.OnTouch;//倾斜
        Prims.table.onlightD = Prims.OnTouch;//光电(距离)
        /*Prims.table.onlightB = Prims.OnTouch;//光电
        Prims.table.onlightW = Prims.OnTouch;//光电*/
        Prims.table.onbutt = Prims.OnTouch;//按钮
        /*Prims.table.onvoiceL = Prims.OnTouch;//自学习语音*/
        Prims.table.onvoice = Prims.OnTouch;//语音

        Prims.table.onaiFace = Prims.OnFace;//人脸 
        Prims.table.onaiHand = Prims.OnHand;//
        Prims.table.onaiPose = Prims.OnPose;//
        

   /*
        Prims.robot = {};
        Prims.robot.power_left  = 0;
        Prims.robot.power_right = 0;
        Prims.robot.moving = false; */

        Robot.init();
    }


 /*
  static robot_send_power_command(robot_version, left_speed, right_speed){



    let url = `http://127.0.0.1:9876/txt/def/${robot_version}/rob_power/${left_speed}/${right_speed}`;

  //  console.log("[Engine::Prims.js::robot_send_power_command::url1:] " + url);

     var xhr = new XMLHttpRequest();
     xhr.open('GET', url, true);

     xhr.onload = function(){
        if(this.status == 200){
           //  alert("sucess");
        }
        else{
           var error = new Error(this.statusText);
           error.code = this.status;
           alert("error:" + error);
        }
    };

    xhr.onerror = function() {
    //  alert("Network error");
    };

    xhr.send();

//    console.log("[Engine::Prims.js::robot_send_power_command::url2:] " + url);

    }


static robot_send_power_command_desktop(robot_version, left_speed, right_speed){

  return new Promise(function(resolve, reject) {
    let url = `http://127.0.0.1:9876/txt/def/${robot_version}/rob_power/${left_speed}/${right_speed}`;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function() {
    if (this.status == 200) {
       if (resolve)
            resolve(this.response);
       }
       else {
            var error = new Error(this.statusText);
            error.code = this.status;
            if (reject)
            reject(error);
       }
    };

    xhr.onerror = function() {
       reject(new Error("Network Error"));
    };

    xhr.send();

    console.log("[Engine::Prims.js::robot_send_power_command::url:] " + url);

  });
}

 */


    /*** Robot Block start ***/


//    static Robot_forward(strip){
//       if(Prims.robot.moving) return;
//
//       console.log("[engine] robot_forward=" + strip);
// //      Prims.robot.moving = true;
//
//         //    Prims.setTime(strip);
//
//       console.log("[robbo_forward:]" + new Date());
//
//
//       //strip.thisblock.can_execute = false;
//
//       let power_in_percent = 30; //Мощность в процетах.
//       let power = Math.round(power_in_percent * 0.63);
//
//       Prims.robot.power_left = power;
//       Prims.robot.power_right = power;
//
//       var execution_time = Number(strip.thisblock.getArgValue()) * 1000;
//       strip.waitTimer = execution_time;
//
//       for(var j = 0; j < execution_time / 200 ; j++){
//          setTimeout(function(){
//           Prims.robot_send_power_command(strip.robot_version, Prims.robot.power_left.toString(16), Prims.robot.power_right.toString(16))
//          }, 200 * j);
//       }
//
//       setTimeout(function(){
//          console.log("[engine] nextBlock()");
//          Prims.robot.moving = false;
//          Prims.robot_send_power_command(strip.robot_version, "00", "00")
//          Prims.DoNextBlock(strip);
//       }, execution_time);
//
// //      Prims.DoNextBlock(strip);
//    }
//
//
//
//    static Robot_back(strip){
//       if(Prims.robot.moving) return;
//       console.log("[engine] robot_forward=" + strip);
// //      Prims.robot.moving = true;
//
//       //strip.waitTimer = 10/*Math.round(Number(strip.thisblock.getArgValue()) * 1000 / 32 + 1)*/;
//
// //      strip.thisblock.can_execute = false;
//
//       let power_in_percent = 30; //Мощность в процетах.
//       let power = Math.round(power_in_percent * 0.63) + 64;
//
//       Prims.robot.power_left = power;
//       Prims.robot.power_right = power;
//
//       var execution_time = Number(strip.thisblock.getArgValue()) * 1000;
//       strip.waitTimer = execution_time;
//
//       for(var j = 0; j < execution_time / 200 ; j++){
//          setTimeout(function(){
//             Prims.robot_send_power_command(strip.robot_version, Prims.robot.power_left.toString(16), Prims.robot.power_right.toString(16))
//          }, 200 * j);
//       }
//
//
//       setTimeout(function(){
//          console.log("[engine] nextBlock()");
//          Prims.robot.moving = false;
//          Prims.robot_send_power_command(strip.robot_version, "00", "00")
//          Prims.DoNextBlock(strip);
//       }, execution_time);
//
// //      Prims.DoNextBlock(strip);
//    }
//
//
//   static Robot_left(strip){
//
//
//       if(Prims.robot.moving) return;
//       console.log("[engine] robot_up=" + strip);
//   //      Prims.robot.moving = true;
//
//       //strip.waitTimer = 10/*Math.round(Number(strip.thisblock.getArgValue()) * 1000 / 32 + 1)*/;
//
//   //      strip.thisblock.can_execute = false;
//
//       let power_in_percent = 30; //Мощность в процетах.
//       let power = Math.round(power_in_percent * 0.63);
//
//       Prims.robot.power_left = power + 64;
//       Prims.robot.power_right = power;
//
//       var execution_time = Number(strip.thisblock.getArgValue()) * 1000;
//       strip.waitTimer = execution_time;
//
//       for(var j = 0; j < execution_time / 200 ; j++){
//          setTimeout(function(){
//             Prims.robot_send_power_command(strip.robot_version, Prims.robot.power_left.toString(16), Prims.robot.power_right.toString(16))
//          }, 200 * j);
//       }
//
//
//       setTimeout(function(){
//          console.log("[engine] nextBlock()");
//          Prims.robot.moving = false;
//          Prims.robot_send_power_command(strip.robot_version, "00", "00")
//          Prims.DoNextBlock(strip);
//       }, execution_time);
//     }
//
//     static Robot_right(strip){
//
//       if(Prims.robot.moving) return;
//       console.log("[engine] robot_down=" + strip);
//   //      Prims.robot.moving = true;
//
//       //strip.waitTimer = 10/*Math.round(Number(strip.thisblock.getArgValue()) * 1000 / 32 + 1)*/;
//
//   //      strip.thisblock.can_execute = false;
//
//       let power_in_percent = 30; //Мощность в процетах.
//       let power = Math.round(power_in_percent * 0.63);
//
//       Prims.robot.power_left = power;
//       Prims.robot.power_right = power + 64;
//
//       var execution_time = Number(strip.thisblock.getArgValue()) * 1000;
//       strip.waitTimer = execution_time;
//
//       for(var j = 0; j < execution_time / 200 ; j++){
//          setTimeout(function(){
//             Prims.robot_send_power_command(strip.robot_version, Prims.robot.power_left.toString(16), Prims.robot.power_right.toString(16))
//          }, 200 * j);
//       }
//
//
//       setTimeout(function(){
//          console.log("[engine] nextBlock()");
//          Prims.robot.moving = false;
//          Prims.robot_send_power_command(strip.robot_version, "00", "00")
//          Prims.DoNextBlock(strip);
//       }, execution_time);
//     }

    /*** Robot Block end ***/


    static Done (strip) {
        if (strip.oldblock != null) {
            strip.oldblock.unhighlight();
        }
        strip.oldblock = null;
        strip.isRunning = false;
    }

    static setTime (strip) {
        strip.time = (new Date()) - 0;
    }

    static showTime () {
        //var time = ((new Date()) - strip.time) / 1000;
        // 	ScratchJr.log (strip.thisblock.blocktype, time, "sec") ;
    }

    static DoNextBlock (strip) {
        strip.waitTimer = tinterval * 10;
        strip.thisblock = strip.thisblock.next;
    }

    static StopAll () {
        ScratchJr.stopStrips();
    }

    static StopMine (strip) {
        var spr = strip.spr;
        for (var i = 0; i < ScratchJr.runtime.threadsRunning.length; i++) {
            if ((ScratchJr.runtime.threadsRunning[i].spr == spr)
                 && (ScratchJr.runtime.threadsRunning[i].thisblock != strip.thisblock)) {
                ScratchJr.runtime.threadsRunning[i].stop(true);
            }
        }
        strip.thisblock = strip.thisblock.next;
        ScratchJr.runtime.yield = true;
    }

    static playSound (strip) {
        var b = strip.thisblock;
        var name = b.getSoundName(strip.spr.sounds);
        //	console.log ('playSound', name);
        if (!strip.audio) {
            
            var snd = ScratchAudio.projectSounds[name];

            if (!snd) { 
                strip.thisblock = strip.thisblock.next;
                return;
            }
            strip.audio = snd;
            snd.play();

        //	console.log ("playSound", snd, strip.audio, snd.source.playbackState);
        }

        if (strip.audio && strip.audio.done()) {
            console.log("sound_done");
            strip.audio.clear();
            strip.thisblock = strip.thisblock.next;
            strip.audio = undefined;
        }
        strip.waitTimer = tinterval * 4;
    }


    static Say (strip) {
        var b = strip.thisblock;
        var s = strip.spr;
        var str = b.getArgValue();
        if (strip.count < 0) {
            strip.count = Math.max(30, Math.round(str.length / 8) * 30); // 7 chars per seconds;
            s.openBalloon(str);
            Prims.setTime(strip);
        } else {
            var count = strip.count;
            count--;
            if (count < 0) {
                strip.count = -1;
                s.closeBalloon();
                Prims.showTime(strip);
                strip.thisblock = strip.thisblock.next;
            } else {
                strip.waitTimer = tinterval;
                strip.count = count;
            }
        }
    }

    static GotoPage (strip) {
        var b = strip.thisblock;
        var n = Number(b.getArgValue());
        if (strip.count < 0) {
            strip.count = 2; // delay for a 10th of a second
            Prims.setTime(strip);
        } else {
            var count = strip.count;
            count--;
            if (count < 0) {
                strip.count = -1;
                Prims.showTime(strip);
                ScratchJr.stage.gotoPage(n);
            } else {
                strip.waitTimer = tinterval;
                strip.count = count;
            }
        }
    }

    static Forever (strip) {
        strip.thisblock = strip.firstBlock.aStart ? strip.firstBlock.next : strip.firstBlock;
        ScratchJr.runtime.yield = true;
    }

    static Repeat (strip) {
        var b = strip.thisblock;
        var n = Number(b.getArgValue());
        if (n < 1) {
            n = 1;
        }
        if (b.repeatCounter < 0) {
            b.repeatCounter = n;
        }
        if (b.repeatCounter == 0) {
            b.repeatCounter = -1;
            strip.thisblock = strip.thisblock.next;
            strip.waitTimer = tinterval;
        } else {
            strip.stack.push(strip.thisblock);
            b.repeatCounter--;
            strip.thisblock = strip.thisblock.inside;
            ScratchJr.runtime.yield = true;
        }
    }

    static Ignore (strip) {
        strip.thisblock = strip.thisblock.next;
    }

    static Wait (strip) {
        var n = strip.thisblock.getArgValue();
        strip.waitTimer = Math.round(n * 3.125); // thenth of a second
        Prims.setTime(strip);
        strip.thisblock = strip.thisblock.next;
    }

    static Home (strip) {
        var spr = strip.spr;
        spr.goHome();
        strip.waitTimer = tinterval;
        strip.thisblock = strip.thisblock.next;
    }

    static SetSpeed (strip) {
        var s = strip.spr;
        var num = Number(strip.thisblock.getArgValue()); // 0 - 1 - 2
        s.speed = Math.pow(2, num);
        strip.waitTimer = tinterval;
        strip.thisblock = strip.thisblock.next;
    }

    static Hop (strip) {
        if (strip.count < 0) { // setup the hop
            strip.count = hopList.length;
            Prims.setTime(strip);
        }
        Prims.hopTo(strip);
    }

    static hopTo (strip) {
        var s = strip.spr;
        var b = strip.thisblock;
        var n = Number(b.getArgValue());
        var count = strip.count;
        count--;
        if (count < 0) {
            strip.count = -1;
            strip.vector = {
                x: 0,
                y: 0
            };
            Prims.showTime(strip);
            strip.thisblock = strip.thisblock.next;
        } else {
            strip.vector = {
                x: 0,
                y: hopList[count]
            };
            var dy = s.ycoor - strip.vector.y / 5 * n;
            if (dy < 0) {
                dy = 0;
            }
            if (dy >= (360 - Grid.size)) {
                dy = (360 - Grid.size);
            }
            s.setPos(s.xcoor + strip.vector.x, dy);
            strip.waitTimer = tinterval + Math.floor(Math.pow(2, 2 - Math.floor(s.speed / 2)) / 2);
            strip.count = count;
        }
    }

    static Down (strip) {
        var num = Number(strip.thisblock.getArgValue()) * 24;
        var distance = Math.abs(num);
        if (num == 0) {
            strip.thisblock = strip.thisblock.next;
            strip.waitTimer = tinterval;
            strip.distance = -1;
            strip.vector = {
                x: 0,
                y: 0
            };
            return;
        }
        if (num == 0) {
            strip.distance = 0;
        } else if (strip.distance < 0) {
            strip.distance = distance;
            strip.vector = {
                x: 0,
                y: 2
            };
            Prims.setTime(strip);
        }
        Prims.moveAtSpeed(strip);
    }

    static Up (strip) {
        var num = Number(strip.thisblock.getArgValue()) * 24;
        var distance = Math.abs(num);
        if (num == 0) {
            strip.thisblock = strip.thisblock.next;
            strip.waitTimer = tinterval;
            strip.distance = -1;
            strip.vector = {
                x: 0,
                y: 0
            };
            return;
        } else if (strip.distance < 0) {
            strip.distance = distance;
            strip.vector = {
                x: 0,
                y: -2
            };
            Prims.setTime(strip);
        }
        Prims.moveAtSpeed(strip);
    }

    static Forward (strip) {
        var s = strip.spr;
        var num = Number(strip.thisblock.getArgValue()) * 24;
        var distance = Math.abs(num);

        if ((s.need_flip =="true")){
            s.flip = true;
            s.render();

          }else if (s.flip) {
              s.flip = false;
              s.render();

            }

        if (num == 0) {
            strip.thisblock = strip.thisblock.next;
            strip.waitTimer = tinterval * Math.pow(2, 2 - Math.floor(s.speed / 2));
            strip.vector = {
                x: 0,
                y: 0
            };
            strip.distance = -1;
            return;
        } else if (strip.distance < 0) {
            strip.distance = distance;
            strip.vector = {
                x: 2,
                y: 0
            };
            Prims.setTime(strip);
        }
        Prims.moveAtSpeed(strip);
    }

    static Back (strip) {
        var s = strip.spr;
        var num = Number(strip.thisblock.getArgValue()) * 24;
        var distance = Math.abs(num);

        if ((s.need_flip == "true")){
          s.flip = false;
          s.render();

        }else{

          if (!s.flip) {
              s.flip = true;
              s.render();
            }

          }

        if (num == 0) {
            strip.thisblock = strip.thisblock.next;
            strip.vector = {
                x: 0,
                y: 0
            };
            strip.waitTimer = tinterval * Math.pow(2, 2 - Math.floor(s.speed / 2));
            return;
        }
        if (num == 0) {
            strip.distance = 0;
        } else if (strip.distance < 0) {
            strip.distance = distance;
            strip.vector = {
                x: -2,
                y: 0
            };
            Prims.setTime(strip);
        }
        Prims.moveAtSpeed(strip);
    }

    static moveAtSpeed (strip) {
        var s = strip.spr;
        var distance = strip.distance;
        var num = Number(strip.thisblock.getArgValue()) * 12; // 1/2 cell size since vector is double
        var vector = Vector.scale(strip.vector, s.speed * Math.abs(num) / num);
        distance -= Math.abs(Vector.len(vector));
        if (distance < 0) {
            vector = Vector.scale(strip.vector, strip.distance);
            s.setPos(s.xcoor + vector.x, s.ycoor + vector.y);
            strip.distance = -1;
            strip.vector = {
                x: 0,
                y: 0
            };
            Prims.showTime(strip);
            strip.thisblock = strip.thisblock.next;
        } else {
            s.setPos(s.xcoor + vector.x, s.ycoor + vector.y);
            strip.waitTimer = tinterval;
            strip.distance = distance;
        }
    }

    static Right (strip) {
        var s = strip.spr;
        var num = Number(strip.thisblock.getArgValue()) * 30;
        if (strip.count < 0) {
            strip.count = Math.floor(Math.abs(num) / s.speed * 0.25);
            strip.angleStep = s.speed * 4 * Math.abs(num) / num;
            strip.finalAngle = s.angle + num;
            strip.finalAngle = strip.finalAngle % 360;
            if (strip.finalAngle < 0) {
                strip.finalAngle += 360;
            }
            if (strip.finalAngle > 360) {
                strip.finalAngle -= 360;
            }
            Prims.setTime(strip);
        }
        Prims.turning(strip);
    }

    static Left (strip) {
        var s = strip.spr;
        var num = Number(strip.thisblock.getArgValue()) * 30;
        if (strip.count < 0) {
            strip.count = Math.floor(Math.abs(num) / s.speed * 0.25);
            strip.angleStep = -s.speed * 4 * Math.abs(num) / num;
            strip.finalAngle = s.angle - num;
            strip.finalAngle = strip.finalAngle % 360;
            if (strip.finalAngle < 0) {
                strip.finalAngle += 360;
            }
            if (strip.finalAngle > 360) {
                strip.finalAngle -= 360;
            }
            Prims.setTime(strip);
        }
        Prims.turning(strip);
    }

    static turning (strip) {
        var s = strip.spr;
        var count = strip.count;
        count--;
        if (count < 0) {
            strip.count = -1;
            s.setHeading(strip.finalAngle);
            Prims.showTime(strip);
            strip.thisblock = strip.thisblock.next;
        } else {
            s.setHeading(s.angle + strip.angleStep);
            strip.waitTimer = tinterval;
            strip.count = count;
        }
    }

    static Same (strip) {
        var s = strip.spr;
        var n = (s.defaultScale - s.scale) / s.defaultScale * 10;
        if (n == 0) {
            strip.waitTimer = tinterval;
            strip.thisblock = strip.thisblock.next;
            strip.count = -1;
            strip.distance = -1;
            if (!strip.firstBlock.aStart) {
                s.homescale = s.defaultScale;
            }
            return;
        }
        if (strip.count < 0) {
            strip.distance = s.defaultScale * Math.abs(n) / n * s.speed;
            strip.count = Math.floor(5 * Math.floor(Math.abs(n)) / s.speed);
            Prims.setTime(strip);
            if (!strip.firstBlock.aStart) {
                s.homescale = s.defaultScale;
            }
        }
        if (strip.count == 0) {
            strip.count = -1;
            s.noScaleFor();
            strip.distance = -1;
            Prims.showTime(strip);
            strip.thisblock = strip.thisblock.next;
        } else {
            s.changeSizeBy(strip.distance * 2);
            strip.waitTimer = tinterval;
            strip.count = strip.count - 1;
        }
    }

    static Grow (strip) {
        var s = strip.spr;
        var n = Number(strip.thisblock.getArgValue());
        if (strip.count < 0) {
            strip.distance = Number(s.scale) + (10 * n * s.defaultScale) / 100;
            strip.distance = Math.round(strip.distance * 1000) / 1000;
            strip.count = Math.floor(5 * Math.abs(n) / s.speed);
            Prims.setTime(strip);
        }
        if (strip.count == 0) {
            strip.count = -1;
            s.setScaleTo(strip.distance);
            if (!strip.firstBlock.aStart) {
                s.homescale = s.scale;
            }
            strip.distance = -1;
            Prims.showTime(strip);
            strip.thisblock = strip.thisblock.next;
        } else {
            s.changeSizeBy(s.defaultScale * 2 * s.speed * Math.abs(n) / n);
            strip.waitTimer = tinterval;
            strip.count = strip.count - 1;
        }
    }

    static Shrink (strip) {
        var s = strip.spr;
        var n = Number(strip.thisblock.getArgValue());
        if (strip.count < 0) {
            strip.distance = s.scale - (10 * n * s.defaultScale) / 100;
            strip.distance = Math.round(strip.distance * 1000) / 1000;
            strip.count = Math.floor(5 * Math.abs(n) / s.speed);
            Prims.setTime(strip);
        }
        if (strip.count == 0) {
            strip.count = -1;
            s.setScaleTo(strip.distance);
            if (!strip.firstBlock.aStart) {
                s.homescale = s.scale;
            }
            strip.distance = -1;
            Prims.showTime(strip);
            strip.thisblock = strip.thisblock.next;
        } else {
            s.changeSizeBy(-s.defaultScale * 2 * s.speed * Math.abs(n) / n);
            strip.waitTimer = tinterval;
            strip.count = strip.count - 1;
        }
    }

    static Show (strip) {
        var s = strip.spr;
        s.shown = true;
        if (strip.count < 0) {
            strip.count = s.speed == 4 ? 0 : Math.floor(15 / s.speed);
            Prims.setTime(strip);
        }
        if (strip.count == 0) {
            strip.count = -1;
            s.div.style.opacity = 1;
            Prims.showTime(strip);
            strip.thisblock = strip.thisblock.next;
            if (!strip.firstBlock.aStart) {
                s.homeshown = true;
            }
        } else {
            s.div.style.opacity = Math.min(1, Number(s.div.style.opacity) + (s.speed / 15));
            strip.waitTimer = tinterval * 2;
            strip.count = strip.count - 1;
        }
    }

    static Hide (strip) { // same
        var s = strip.spr;
        s.shown = false;
        if (strip.count < 0) {
            strip.count = s.speed == 4 ? 0 : Math.floor(15 / s.speed);
            Prims.setTime(strip);
        }
        if (strip.count == 0) {
            strip.count = -1;
            s.div.style.opacity = 0;
            Prims.showTime(strip);
            strip.thisblock = strip.thisblock.next;
            if (!strip.firstBlock.aStart) {
                s.homeshown = false;
            }
        } else {
            s.div.style.opacity = Math.max(0, Number(s.div.style.opacity) - (s.speed / 15));
            strip.waitTimer = tinterval * 2;
            strip.count = strip.count - 1;
        }
    }

    static OnTouch (strip) {
        var s = strip.spr;
        var b = strip.thisblock.getArgValue();
        
        if (b==null ) {//碰撞块时
            if(s.touchingAny()){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
            
        }else{//其他触发块
            //alert(voice_data[1]);
            //------------------------------倾斜传感器9---------------------------
            if(b=="tilt-f" ){//前倾
                if(tilt_data[1]=="01"){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }else if(b=="tilt-b"){//后倾
                if(tilt_data[1]=="02"){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }else if(b=="tilt-l"){//左倾
                if(tilt_data[1]=="03"){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }else if(b=="tilt-r"){//右倾
                if(tilt_data[1]=="04"){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }else if(b=="tilt-l-rot"){//左旋
                if(tilt_data[1]=="05"){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }else if(b=="tilt-r-rot"){//右旋
                if(tilt_data[1]=="06"){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }else if(b=="tilt-level"){//水平
                if(tilt_data[1]=="00"){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }else if(b=="tilt-shak1"){//晃动
                if(tilt_data[1]=="08"){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }else if(b=="tilt-shak"){//剧烈晃动
                if(tilt_data[1]=="09"){

                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            //------------------------------按钮2---------------------------
            else if(b=="button-1"){//按钮1
                if( button_data1[1]=="00" ){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }else if(b=="button-2"){//按钮2
                if(button_data2[1]=="00"){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            //------------------------------光电7---------------------------
            else if(b=="light-n"){//近距离
                if(port1=="01"){
                    if(0 < light_data1[1] && light_data1[1] <= 4){
                        strip.stack.push(strip.firstBlock);
                        strip.thisblock = strip.thisblock.next;
                    }
                }else{
                    if(0 < light_data2[1] &&light_data2[1] <= 4){
                        strip.stack.push(strip.firstBlock);
                        strip.thisblock = strip.thisblock.next;
                    }
                }
            }
            else if(b=="light-m"){//中距离
                if(port1=="01"){
                    if(4 < light_data1[1] && light_data1[1]<=8){
                        strip.stack.push(strip.firstBlock);
                        strip.thisblock = strip.thisblock.next;
                    }
                }else{
                    if(light_data2[1]>4 && light_data2[1]<=8){
                        strip.stack.push(strip.firstBlock);
                        strip.thisblock = strip.thisblock.next;
                    }
                }
                
            }
            else if(b=="light-f"){//远距离
                if(port1=="01"){
                    if(light_data1[1]>8){
                        strip.stack.push(strip.firstBlock);
                        strip.thisblock = strip.thisblock.next;
                    }
                }else{
                    if(light_data2[1]>8){
                        strip.stack.push(strip.firstBlock);
                        strip.thisblock = strip.thisblock.next;
                    }
                }
            }
            else if(b=="light-b1"){//黑1
                if( light_data1[1]>5 ){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            else if(b=="light-b2"){//黑2
                if( light_data2[1]>5 ){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            else if(b=="light-w1"){//白1
                if( light_data1[1]<=5 ){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            else if(b=="light-w2"){//白2
                if( light_data2[1]<=5 ){
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            //------------------------------语音15---------------------------
            else if(b=="voiceL-1"){//自学习1
                if(voice_data[1]=="31" ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }else if(b=="voiceL-2"){//自学习2
                if(voice_data[1]=="32"  ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }else if(b=="voiceL-3"){//自学习3
                if(voice_data[1]=="33"  ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            // else if(b=="voiceL-4"){//自学习4
            //     if(voice_data[1]=="34"  ){
            //         strip.stack.push(strip.firstBlock);
            //         strip.thisblock = strip.thisblock.next;
            //     }
            // }else if(b=="voiceL-5"){//自学习5
            //     if(voice_data[1]=="27"  ){
            //         strip.stack.push(strip.firstBlock);
            //         strip.thisblock = strip.thisblock.next;
            //     }
            // }else if(b=="voiceL-6"){//自学习6
            //     if(voice_data[1]=="28"  ){
            //         strip.stack.push(strip.firstBlock);
            //         strip.thisblock = strip.thisblock.next;
            //     }
            // }

            else if(b=="r"){//语音-向右
                if(voice_data[1]=="1F" ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            else if(b=="l"){//语音-向左
                if(voice_data[1]=="1E"  ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            else if(b=="up"){//语音-向上
                if(voice_data[1]=="20"  ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            else if(b=="dw"){//语音-向下
                if(voice_data[1]=="21"  ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            else if(b=="rr"){//语音-右转
                if(voice_data[1]=="04"  ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            else if(b=="ll"){//语音-左转
                if(voice_data[1]=="03"  ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            else if(b=="j"){//语音-跳跃
                if(voice_data[1]=="24"  ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            else if(b=="s"){//语音-回家
                if(voice_data[1]=="25"  ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }
            else if(b=="sp"){//语音-停止
                if(voice_data[1]=="26"  ){
                    AndroidInterface.steVtype()
                    strip.stack.push(strip.firstBlock);
                    strip.thisblock = strip.thisblock.next;
                }
            }



            
        }
        strip.waitTimer = tinterval;
    }

     //------------------------------人脸---------------------------
    static OnFace (strip) {
        if(aiMode==""){
            aiMode = "face"
            Prims.showAIDialog("face");
        }else if(aiMode!="face"){
            strip.waitTimer = tinterval;
            return
        }
        var s = strip.spr;
        var b = strip.thisblock.getArgValue();
        
        if(b=="face-wx" ){//微笑
            if(face_data[0]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }else if(b=="face-zz"){//张嘴
            if(face_data[1]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }else if(b=="face-zy"){//眨眼
            if(face_data[2]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }else if(b=="face-dz"){//嘟嘴
            if(face_data[3]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }else if(b=="face-tm"){//抬眉
            if(face_data[4]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }
        
        strip.waitTimer = tinterval;
    }
    //------------------------------手势---------------------------
    static OnHand (strip) {
        console.log(aiMode)
        if(aiMode==""){
            aiMode = "hand"
            Prims.showAIDialog("hand");
        }else if(aiMode!="hand"){
            strip.waitTimer = tinterval;
            return
        }
        var s = strip.spr;
        var b = strip.thisblock.getArgValue();
        
        if(b=="hand-qt" ){//拳头
            if(hand_data[2]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }else if(b=="hand-jd" ){//剪刀
            if(hand_data[1]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }else if(b=="hand-b" ){//布
            if(hand_data[3]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }
        strip.waitTimer = tinterval;
    }
    //------------------------------zt---------------------------
    static OnPose (strip) {
        if(aiMode==""){
            aiMode = "pose"
            Prims.showAIDialog("pose");
        }else if(aiMode!="pose"){
            strip.waitTimer = tinterval;
            return
        }
        var s = strip.spr;
        var b = strip.thisblock.getArgValue();
        
        if(b=="pose-fx" ){//放下
            if(pose_data[0]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }else if(b=="pose-zs" ){//z
            if(pose_data[1]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }else if(b=="pose-ys" ){//y
            if(pose_data[2]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }else if(b=="pose-ss" ){//s
            if(pose_data[3]==1){
                strip.stack.push(strip.firstBlock);
                strip.thisblock = strip.thisblock.next;
            }
        }
        strip.waitTimer = tinterval;
    }

    //辅助汉斯 ai相关
    //打开ai窗口
    static showAIDialog(moduleType) {
        var loc = Cookie.get('localization') || 'zh'; 

        if (window.AndroidInterface) {
            window.AndroidInterface.openAI(moduleType,loc);
        } else if (window.webkit && window.webkit.messageHandlers) {
            window.webkit.messageHandlers.openAI.postMessage("");
        }
    }



    static Message (strip) {
        var b = strip.thisblock;
        var pair;
        if (strip.firstTime) {
            var receivers = [];
            var msg = b.getArgValue();
            var findReceivers = function (block, s) {
                if ((block.blocktype == 'onmessage') && (block.getArgValue() == msg)) {
                    receivers.push([s, block]);
                }
            };
            Prims.applyToAllStrips(['onmessage'], findReceivers);
            var newthreads = [];
            for (var i in receivers) {
                pair = receivers[i];
                newthreads.push(ScratchJr.runtime.restartThread(pair[0], pair[1], true));
            }
            strip.firstTime = false;
            strip.called = newthreads;
        }

        // after first time
        var done = true;
        for (var j = 0; j < strip.called.length; j++) {
            if (strip.called[j].isRunning) {
                done = false;
            }
        }

        if (done) {
            strip.called = null;
            strip.firstTime = true;
            strip.thisblock = strip.thisblock.next;
            strip.waitTimer = tinterval * 2;
        } else {
            ScratchJr.runtime.yield = true;
        }
    }

    static tilt_go (strip) {//倾斜函数
        var b = strip.thisblock.getArgValue();
        alert(b);
        strip.thisblock = strip.thisblock.next;
strip.waitTimer = tinterval;
        
    }

    static applyToAllStrips (list, fcn) {
        if (!ScratchJr.stage) {
            return;
        }
        var page = ScratchJr.stage.currentPage;
        if (!page) {
            return;
        }
        if (!page.div) {
            return;
        }
        for (var i = 0; i < page.div.childElementCount; i++) {
            var spr = page.div.childNodes[i].owner;
            if (!spr) {
                continue;
            }
            var sc = gn(spr.id + '_scripts');
            if (!sc) {
                continue;
            }
            var topblocks = sc.owner.getBlocksType(list);
            for (var j = 0; j < topblocks.length; j++) {
                fcn(topblocks[j], spr);
            }
        }
    }
}
