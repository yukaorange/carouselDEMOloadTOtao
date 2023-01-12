import { Sketch } from "./webgl";
import { test } from "./test";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const sketch = new Sketch({
  dom: document.querySelector("#container"),
});

let speed = 0;
let position = 0;

/**
画面操作を検知し、変数speedに値を代入
そのまま入れると値が大きすぎるので、マジックナンバーで調整(微量の操作でも「1」を超えないようにかなり小さくしている)
*/
if ("ontouchstart" in window) {
  //タッチパネル
  let previousTouchY = 0;
  window.addEventListener("touchstart", (e) => {
    previousTouchY = e.touches[0].clientY;
  });
  window.addEventListener("touchmove", (e) => {
    e.preventDefault(); // 画面スクロールを防止
    const currentTouchY = e.touches[0].clientY;
    const touchDeltaY = previousTouchY - currentTouchY;
    previousTouchY = currentTouchY;
    speed += touchDeltaY * 0.0028;//タッチパネルの場合
  });
}
document.addEventListener("wheel", (event) => {
  speed += event.deltaY * 0.00035;//マウス操作の場合
});

/**
毎フレーム実行される再起処理
(1)speedに小数点以下の値をかけ続けることでユーザー操作によって受付る値を0に向かって収束させる
(2)roundで得た四捨五入の値と現在のpositionの値との差分を取得
(3)差分の範囲を-0.2から+0.2の範囲に限定
(4)差分の位置にpositionはとどまるが、フレームごとにに差分は0に向かって収束する→0.01を下回った時点で四捨五入で得た位置に吸いつく
(5)fragmentシェーダーに渡すprogress値をpositionに同期
(6)画像配列全体のlenghtで割った余りを算出→一定の値の範囲内をループできる
(7)考え方は(6)に同じで、+1。
(8)fragmentシェーダーの画像番号指定を書き換える

*/
function raf() {
  const tl = gsap.timeline();
  position += speed;
  speed *= 0.7;//(1)

  let i = Math.round(position);
  let dif = i - position;//(2)

  dif = dif < 0 ? Math.max(dif, -0.2) : Math.min(dif, +0.2);//(3)

  position += dif * 0.028;
  if (Math.abs(dif) < 0.01) {
    position = i;
  }//(4)

  tl.set(".dot", {
    y: position * 200,
  });//監視サポート用
  sketch.material.uniforms.progress.value = position;//(5)

  let curslide = Math.abs(Math.floor(position) % sketch.gallery.length);//(6)
  let nextSlide = Math.abs((Math.floor(position) + 1) % sketch.gallery.length);//(7)
  // if(position == 0){
  //   nextSlide = sketch.gallery.length;
  // }
  // console.log(curslide, nextSlide);
  sketch.material.uniforms.texture1.value = sketch.gallery[curslide];
  sketch.material.uniforms.texture2.value = sketch.gallery[nextSlide];//(8)

  window.requestAnimationFrame(raf);
}
raf();
