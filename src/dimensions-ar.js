export function distanceCm(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) * 100;
}

const STABILIZE_FRAMES = 18;
const STABILIZE_TOLERANCE_M = 0.015;

function averagePosition(buffer) {
  const sum = buffer.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }),
    { x: 0, y: 0, z: 0 }
  );
  return { x: sum.x / buffer.length, y: sum.y / buffer.length, z: sum.z / buffer.length };
}

function maxSpread(buffer) {
  let max = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let j = i + 1; j < buffer.length; j++) {
      const dx = buffer[i].x - buffer[j].x;
      const dy = buffer[i].y - buffer[j].y;
      const dz = buffer[i].z - buffer[j].z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d > max) max = d;
    }
  }
  return max;
}

export const TAP_PROMPTS = [
  'Align the crosshair on the FRONT-LEFT base corner, then confirm',
  'Align the crosshair on the FRONT-RIGHT base corner, then confirm',
  'Align the crosshair on the BACK-LEFT base corner, then confirm',
  'Align the crosshair on the TOP-FRONT-LEFT corner (directly above point 1), then confirm',
];

export async function isArSupported() {
  if (!navigator.xr) return false;
  try {
    return await navigator.xr.isSessionSupported('immersive-ar');
  } catch {
    return false;
  }
}

export async function startArMeasurement({ onMeasured, onCancel, onUnsupported, onFrameUpdate, onStepChange, overlayElement }) {
  if (!navigator.xr) {
    onUnsupported();
    return;
  }

  const capturedPoints = [];
  let session = null;
  let gl = null;
  let planeHitTestSource = null;
  let pointHitTestSource = null;
  let localSpace = null;
  let stablePosition = null;
  let stabilizeBuffer = [];

  function cleanup() {
    gl = null;
    session = null;
  }

  async function finishMeasurement() {
    const widthCm = distanceCm(capturedPoints[0], capturedPoints[1]);
    const lengthCm = distanceCm(capturedPoints[0], capturedPoints[2]);
    const heightCm = distanceCm(capturedPoints[0], capturedPoints[3]);
    await session.end();
    onMeasured(
      Math.round(lengthCm * 10) / 10,
      Math.round(widthCm * 10) / 10,
      Math.round(heightCm * 10) / 10
    );
  }

  async function confirmPoint() {
    if (!stablePosition) return;
    capturedPoints.push({ ...stablePosition });
    if (capturedPoints.length >= 4) {
      await finishMeasurement();
    } else if (onStepChange) {
      onStepChange(capturedPoints.length);
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

    await gl.makeXRCompatible();
    session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

    localSpace = await session.requestReferenceSpace('local');
    const viewerSpace = await session.requestReferenceSpace('viewer');
    planeHitTestSource = await session.requestHitTestSource({ space: viewerSpace, entityTypes: ['plane'] });
    pointHitTestSource = await session.requestHitTestSource({ space: viewerSpace, entityTypes: ['point'] });

    if (onStepChange) onStepChange(0);

    const onXRFrame = (time, frame) => {
      session.requestAnimationFrame(onXRFrame);

      const planeResults = frame.getHitTestResults(planeHitTestSource);
      const pointResults = frame.getHitTestResults(pointHitTestSource);
      const results = planeResults.length > 0 ? planeResults : pointResults;

      let rawHit = null;
      if (results.length > 0) {
        const pose = results[0].getPose(localSpace);
        if (pose) {
          rawHit = {
            x: pose.transform.position.x,
            y: pose.transform.position.y,
            z: pose.transform.position.z,
          };
        }
      }

      if (rawHit) {
        stabilizeBuffer.push(rawHit);
        if (stabilizeBuffer.length > STABILIZE_FRAMES) stabilizeBuffer.shift();
      } else {
        stabilizeBuffer = [];
      }

      const isStable =
        stabilizeBuffer.length >= STABILIZE_FRAMES && maxSpread(stabilizeBuffer) <= STABILIZE_TOLERANCE_M;
      stablePosition = isStable ? averagePosition(stabilizeBuffer) : null;

      const glLayer = session.renderState.baseLayer;
      gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      if (onFrameUpdate) onFrameUpdate({ hasValidHit: isStable });
    };

    session.requestAnimationFrame(onXRFrame);

    return {
      confirmPoint,
      cancel: async () => {
        await session.end();
        onCancel();
      },
    };
  } catch (error) {
    cleanup();
    onUnsupported(error);
    return null;
  }
}
