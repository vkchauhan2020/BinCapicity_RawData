export function distanceCm(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) * 100;
}

const TAP_PROMPTS = [
  'Tap the front-left base corner of the box',
  'Tap the front-right base corner',
  'Tap the back-left base corner',
  'Tap the top-front-left corner (directly above point 1)',
];

function createReticleGeometry(gl) {
  const segments = 24;
  const radius = 0.05;
  const vertices = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return { buffer, count: segments + 1 };
}

function createShaderProgram(gl) {
  const vertexSrc = `
    attribute vec3 position;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const fragmentSrc = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(0.1, 0.9, 0.3, 0.9);
    }
  `;
  function compile(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  }
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
  gl.linkProgram(program);
  return program;
}

export async function isArSupported() {
  if (!navigator.xr) return false;
  try {
    return await navigator.xr.isSessionSupported('immersive-ar');
  } catch {
    return false;
  }
}

export async function startArMeasurement({ onMeasured, onCancel, onUnsupported, overlayElement }) {
  if (!navigator.xr) {
    onUnsupported();
    return;
  }

  const capturedPoints = [];
  let session = null;
  let gl = null;
  let reticle = null;
  let shaderProgram = null;
  let hitTestSource = null;
  let localSpace = null;

  function updatePrompt() {
    if (overlayElement) {
      const stepText = TAP_PROMPTS[capturedPoints.length] || '';
      overlayElement.querySelector('.ar-prompt-text').textContent = stepText;
    }
  }

  function cleanup() {
    if (gl) {
      gl = null;
    }
    session = null;
  }

  function finishMeasurement() {
    const lengthCm = distanceCm(capturedPoints[0], capturedPoints[1]);
    const widthCm = distanceCm(capturedPoints[0], capturedPoints[2]);
    const heightCm = distanceCm(capturedPoints[0], capturedPoints[3]);
    session.end();
    onMeasured(
      Math.round(lengthCm * 10) / 10,
      Math.round(widthCm * 10) / 10,
      Math.round(heightCm * 10) / 10
    );
  }

  function onSelect() {
    if (!reticle || !reticle.visible) return;
    capturedPoints.push({ ...reticle.position });
    if (capturedPoints.length >= 4) {
      finishMeasurement();
    } else {
      updatePrompt();
    }
  }

  function onSessionEnded() {
    cleanup();
  }

  try {
    const canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl', { xrCompatible: true });

    const sessionInit = {
      requiredFeatures: ['hit-test'],
      optionalFeatures: overlayElement ? ['dom-overlay'] : [],
    };
    if (overlayElement) {
      sessionInit.domOverlay = { root: overlayElement };
    }

    session = await navigator.xr.requestSession('immersive-ar', sessionInit);
    session.addEventListener('end', onSessionEnded);
    session.addEventListener('select', onSelect);

    await gl.makeXRCompatible();
    session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

    localSpace = await session.requestReferenceSpace('local');
    const viewerSpace = await session.requestReferenceSpace('viewer');
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

    shaderProgram = createShaderProgram(gl);
    const geometry = createReticleGeometry(gl);
    reticle = { visible: false, position: { x: 0, y: 0, z: 0 } };

    updatePrompt();

    const onXRFrame = (time, frame) => {
      session.requestAnimationFrame(onXRFrame);
      const results = frame.getHitTestResults(hitTestSource);
      if (results.length > 0) {
        const pose = results[0].getPose(localSpace);
        if (pose) {
          reticle.visible = true;
          reticle.position = {
            x: pose.transform.position.x,
            y: pose.transform.position.y,
            z: pose.transform.position.z,
          };
        }
      } else {
        reticle.visible = false;
      }

      const glLayer = session.renderState.baseLayer;
      gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(shaderProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, geometry.buffer);
    };

    session.requestAnimationFrame(onXRFrame);

    if (overlayElement) {
      const cancelBtn = overlayElement.querySelector('.ar-cancel-btn');
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          session.end();
          onCancel();
        };
      }
    }
  } catch (error) {
    cleanup();
    onUnsupported(error);
  }
}
