uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float progress;

uniform vec2 pixels;
uniform vec2 uvRate1;
uniform vec2 accel;//vec2(0.5,2.)

uniform float time;

varying vec2 vUv;
varying vec2 vUv1;

//0.→2.0→0.の範囲で値を返却
vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.);//受け取った引数を2.で割った余りを返す
  return mix(m, 2. - m, step(1., m));//線形補完の保管率がm>1.で1となり、返す値の係数（傾き）がマイナスに振れる
}
//
float tri(float p) {
  return mix(p, 1. - p, step(0.5, p)) * 2.;
}

//(1)progressでわたってくる値の小数点以下のみを取得してpに代入（pは0.1から0.99・・・）
//(2)pをマジックナンバーで増幅し、uv.yの発色を遅らせる&uv.xの発色を早める、さらに-2.0
//(3)上記(2)で作成したdelayの値の範囲を0.～1.に限定（1.以上の範囲に振れると色反転などがおこる）
//(4)accel vec2(0.5,2.0)に対し上記delayを乗算し、pを加える
//(5)

void main() {
  vec2 uv = gl_FragCoord.xy / pixels.xy;//ほぼ1:1
  float p = fract(progress);//(1)

  // float delayValue = p * 7. - uv.y * 2. + uv.x - 4.;//(2)
  float delayValue = p * 10. - uv.y * 2. - 3.;//(2)
  delayValue = clamp(delayValue, 0., 1.);//(3)

  vec2 translateValue = p + delayValue * accel;//(4)
  vec2 translateValue1 = vec2(-0.5, 1.) * translateValue;//(5)
  vec2 translateValue2 = vec2(-0.5, 1.) * (translateValue - 1. - accel);//(6)

  vec2 w = sin(sin(time) * vec2(0., 0.3) + vUv.yx * vec2(0, 4.4)) * vec2(0., 0.5);
  vec2 xy = w * (tri(p) * 0.5 + tri(delayValue) * 0.5);

  // vec2 uv1 = vUv1 + translateValue1 + xy;
  // vec2 uv2 = vUv1 + translateValue2 + xy;
  vec2 uv1 = vUv1;
  vec2 uv2 = vUv1;

  // vec4 rgba1 = texture2D(texture1, mirrored(uv1));
  // vec4 rgba2 = texture2D(texture2, mirrored(uv2));
  vec4 rgba1 = texture2D(texture1, uv1);
  vec4 rgba2 = texture2D(texture2, uv2);
  vec4 rgba = mix(rgba1, rgba2, delayValue);

  gl_FragColor = rgba;
}