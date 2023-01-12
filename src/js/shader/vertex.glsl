uniform vec2 uvRate1;
uniform float uYAspect;
uniform float uXAspect;

varying vec2 vUv;
varying vec2 vUv1;

// (1)一時的に-0.5から+0.5(中心を0にしたい)に座標系を変換
// (2)アスペクト比をbackground-coverに保つ(値を1.以下にすることで発色のタイミングが遅れる→視覚的には引き延ばされる)
// (3)上記(1)でずらした座標系をもとに戻す

void main() {
  vUv = uv;
  vec2 _uv = uv - 0.5;//(1)
  vUv1 = _uv;
  // vUv1 *= uvRate1.xy;
  vUv1.y *= min(uYAspect, 1.0);//(2)
  vUv1.x *= min(uXAspect, 1.0);
  vUv1 += 0.5;//(3)
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}