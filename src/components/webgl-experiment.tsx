"use client";
import { useEffect, useRef, useState } from "react";

const heroVertex = `attribute vec2 position; void main(){ gl_Position=vec4(position,0.,1.); }`;
const heroFragment = `precision mediump float;
uniform vec2 u_resolution; uniform float u_time; uniform vec2 u_mouse;
void main(){
  // Normalize pixel coordinates so the pattern survives different screens.
  vec2 uv=gl_FragCoord.xy/u_resolution;
  // Three slow waves create a continuous field; the mouse nudges its center.
  float wave=sin(uv.x*5.+u_time*.25+u_mouse.x)*.5+.5;
  float band=sin(uv.y*7.+wave*3.-u_time*.18+u_mouse.y)*.5+.5;
  // A dark green base preserves readable foreground text at every phase.
  vec3 color=mix(vec3(.04,.12,.10),vec3(.16,.30,.20),band);
  color+=vec3(.04,.08,.025)*pow(wave,3.);
  gl_FragColor=vec4(color,1.);
}`;
const cubeVertex = `attribute vec3 position; uniform float angle; uniform float aspect; varying float light;
void main(){
  float c=cos(angle),s=sin(angle);
  vec3 p=position;
  p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);
  float t=.45; p=vec3(p.x,cos(t)*p.y-sin(t)*p.z,sin(t)*p.y+cos(t)*p.z);
  light=.55+.45*(p.y+1.)/2.;
  float depth=4.-p.z;
  gl_Position=vec4(p.x*2.6/aspect,p.y*2.6,depth-2.,depth);
}`;
const cubeFragment = `precision mediump float; uniform vec3 color; varying float light; void main(){gl_FragColor=vec4(color*light,1.);}`;
const cubeVertices = new Float32Array([
  -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, -1, 1,
  -1, 1, 1, -1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, -1, 1, -1, 1,
  1, -1, -1, -1, -1, 1, 1, -1, 1, -1, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, -1,
  1, 1, 1, 1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1, -1,
  -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, -1, 1, -1, 1, -1, -1, 1,
]);

export function WebGLExperiment({ mode }: { mode: "hero" | "cube" }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const angle = useRef(0.55);
  const mouse = useRef([0, 0]);
  const [color, setColor] = useState("#639b71");
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);
  const colorValue = useRef(color);
  colorValue.current = color;
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(!media.matches);
    const change = () => setEnabled(!media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!enabled || !canvas.current) return;
    const element = canvas.current;
    const gl = element.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) {
      setFailed(true);
      return;
    }
    const shader = (type: number, source: string) => {
      const object = gl.createShader(type);
      if (!object) throw new Error("Shader allocation failed");
      gl.shaderSource(object, source);
      gl.compileShader(object);
      if (!gl.getShaderParameter(object, gl.COMPILE_STATUS)) {
        gl.deleteShader(object);
        throw new Error("Shader compilation failed");
      }
      return object;
    };
    const program = gl.createProgram();
    if (!program) {
      setFailed(true);
      return;
    }
    let vertex: WebGLShader | undefined, fragment: WebGLShader | undefined;
    try {
      vertex = shader(
        gl.VERTEX_SHADER,
        mode === "hero" ? heroVertex : cubeVertex,
      );
      fragment = shader(
        gl.FRAGMENT_SHADER,
        mode === "hero" ? heroFragment : cubeFragment,
      );
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Program link failed");
    } catch {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      gl.deleteProgram(program);
      setFailed(true);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      mode === "hero"
        ? new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
        : cubeVertices,
      gl.STATIC_DRAW,
    );
    const location = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(
      location,
      mode === "hero" ? 2 : 3,
      gl.FLOAT,
      false,
      0,
      0,
    );
    const uniforms = Object.fromEntries(
      ["u_resolution", "u_time", "u_mouse", "angle", "aspect", "color"].map(
        (name) => [name, gl.getUniformLocation(program, name)],
      ),
    );
    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      element.width = Math.max(1, Math.floor(element.clientWidth * ratio));
      element.height = Math.max(1, Math.floor(element.clientHeight * ratio));
      gl.viewport(0, 0, element.width, element.height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    let frame = 0;
    const render = (time: number) => {
      if (document.hidden) {
        frame = 0;
        return;
      }
      gl.clearColor(0.94, 0.96, 0.91, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      if (mode === "hero") {
        gl.uniform2f(uniforms.u_resolution, element.width, element.height);
        gl.uniform1f(uniforms.u_time, time / 1000);
        gl.uniform2f(uniforms.u_mouse, mouse.current[0], mouse.current[1]);
      } else {
        gl.enable(gl.DEPTH_TEST);
        gl.uniform1f(uniforms.angle, angle.current);
        gl.uniform1f(uniforms.aspect, element.width / element.height);
        const hex = colorValue.current;
        gl.uniform3f(
          uniforms.color,
          parseInt(hex.slice(1, 3), 16) / 255,
          parseInt(hex.slice(3, 5), 16) / 255,
          parseInt(hex.slice(5, 7), 16) / 255,
        );
      }
      gl.drawArrays(gl.TRIANGLES, 0, mode === "hero" ? 6 : 36);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!frame) frame = requestAnimationFrame(render);
    };
    const lost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      setFailed(true);
    };
    document.addEventListener("visibilitychange", visibility);
    element.addEventListener("webglcontextlost", lost);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      element.removeEventListener("webglcontextlost", lost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
    };
  }, [enabled, mode]);
  return (
    <>
      <section className={mode === "hero" ? "shader-hero" : "cube-stage"}>
        {enabled && !failed ? (
          <canvas
            ref={canvas}
            aria-hidden="true"
            onPointerMove={(event) => {
              const box = event.currentTarget.getBoundingClientRect();
              mouse.current = [
                (event.clientX - box.left) / box.width,
                (event.clientY - box.top) / box.height,
              ];
            }}
          />
        ) : (
          <div
            className="webgl-fallback"
            aria-label={
              mode === "hero"
                ? "Static green aurora background"
                : "Static project cube preview"
            }
          >
            {mode === "cube" && (
              <div className="static-cube" style={{ background: color }} />
            )}
          </div>
        )}
        {mode === "hero" && (
          <div className="shader-content">
            <p className="eyebrow">SURYA TEJA · FRONT-END ENGINEERING</p>
            <h1>
              Make the first
              <br />
              conversation count.
            </h1>
            <p>Thoughtful interfaces. Clear next steps.</p>
          </div>
        )}
      </section>
      {mode === "cube" && (
        <div className="lab-card">
          <h2>Project object configurator</h2>
          <label htmlFor="cube-color">Material color</label>
          <input
            id="cube-color"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="mx-4"
          />
          <label htmlFor="cube-angle">Rotation</label>
          <input
            id="cube-angle"
            type="range"
            min="0"
            max="6.28"
            step=".01"
            defaultValue=".55"
            onChange={(event) => {
              angle.current = Number(event.target.value);
            }}
            className="mx-4"
          />
        </div>
      )}
      <p className="muted-small">
        {failed
          ? "WebGL is unavailable; the static fallback is shown."
          : !enabled
            ? "Reduced-motion / low-power fallback is shown."
            : "WebGL active. Pixel ratio capped at 1.5; rendering pauses in hidden tabs."}
      </p>
    </>
  );
}
