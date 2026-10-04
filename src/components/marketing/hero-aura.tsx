"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uAmp;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

vec3 pal(float x){
  x = fract(x) * 4.0;
  vec3 a = vec3(1.0, 0.39, 0.39);
  vec3 b = vec3(1.0, 0.74, 0.20);
  vec3 c = vec3(0.39, 0.63, 1.0);
  vec3 d = vec3(0.35, 0.83, 0.60);
  if (x < 1.0) return mix(a, b, smoothstep(0.0, 1.0, x));
  if (x < 2.0) return mix(b, c, smoothstep(0.0, 1.0, x - 1.0));
  if (x < 3.0) return mix(c, d, smoothstep(0.0, 1.0, x - 2.0));
  return mix(d, a, smoothstep(0.0, 1.0, x - 3.0));
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  float W = min(asp, 1.5);
  vec2 c = vec2(0.0, 0.04);
  vec2 p = vec2((uv.x - 0.5) * asp, uv.y - 0.5);
  float t = uTime;
  float phase = t * 0.035;
  float amp = uAmp;

  vec2 q = (p - c) / vec2(0.21 * W * (1.0 + 0.03 * amp), 0.095 * (1.0 + 0.08 * amp));
  q += 0.025 * vec2(sin(q.y * 3.0 + t * 0.7), sin(q.x * 2.0 - t * 0.5));
  float r = pow(pow(abs(q.x), 2.6) + pow(abs(q.y), 2.6), 1.0 / 2.6);
  float ring = exp(-pow((r - 1.0) / 0.085, 2.0));
  float halo = exp(-abs(r - 1.0) * 4.5) * 0.4;
  float haze = (1.0 - smoothstep(0.0, 1.0, r)) * 0.14;
  vec3 col = vec3(ring * 1.05 + haze) + pal(phase + 0.2) * halo * 0.55;

  float py = p.y - c.y;
  if (py > 0.0) {
    float ty = clamp(py / (0.5 - c.y), 0.0, 1.0);
    float w = 0.05 * W + 0.17 * W * pow(ty, 1.6);
    float x = p.x + 0.015 * sin(py * 9.0 + t * 0.8);
    float xs = abs(x) / w;
    float m = exp(-xs * xs * 1.5) * (0.4 + 0.75 * ty) * (1.0 + 0.35 * amp);
    float core = exp(-xs * xs * 7.0);
    vec3 pc = mix(pal(phase), pal(phase + 0.5), core);
    col += pc * m * (1.0 - 0.0) + vec3(1.0) * core * ty * 0.5;
  } else {
    float by = clamp(-py / (c.y + 0.5), 0.0, 1.0);
    float w = 0.12 * W * sqrt(max(0.0, 1.0 - pow(by / 0.78, 2.2))) * (1.0 + 0.06 * amp);
    float x = p.x + 0.012 * sin(py * 12.0 - t * 0.9);
    float inside = w - abs(x);
    float edge = exp(-pow(inside / 0.032, 2.0));
    float body = smoothstep(0.0, 0.18, inside);
    float outside = exp(-max(-inside, 0.0) * 16.0) * 0.28 * step(by, 0.82);
    vec3 outer = pal(phase);
    vec3 inner = pal(phase + 0.5);
    col += outer * (edge * 1.1 + outside) + inner * body * 0.85 * (1.0 - by * 0.4);
    col += vec3(1.0) * exp(-by * 9.0) * body * 0.25;
  }

  col = 1.0 - exp(-col * 1.35);
  float v = smoothstep(1.1, 0.25, length(p * vec2(0.8, 1.0)));
  col *= 0.35 + 0.65 * v;
  float lum = dot(col, vec3(0.33));
  col += (hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.12 * (0.25 + lum);
  gl_FragColor = vec4(max(col, vec3(0.016, 0.02, 0.024)), 1.0);
}
`;

export function HeroAura() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, alpha: false });
    if (!canvas || !gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uAmp = gl.getUniformLocation(prog, "uAmp");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const draw = (ms: number) => {
      const t = ms / 1000;
      const amp = 0.5 + 0.5 * Math.sin(t * 1.3) * Math.sin(t * 0.47 + 1);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uAmp, amp);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (ms: number) => {
      if (visible) draw(ms);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw(9000);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    if (still) draw(9000);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
