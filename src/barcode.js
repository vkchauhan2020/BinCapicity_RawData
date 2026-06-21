import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const READER_ELEMENT_ID = 'barcode-reader';

let scannerInstance = null;

const FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.QR_CODE,
];

function classifyError(error) {
  const name = error && error.name;
  if (name === 'NotAllowedError') {
    return 'Camera permission denied. Please enable camera access in your browser settings and try again.';
  }
  if (name === 'NotFoundError') {
    return 'No camera was found on this device.';
  }
  return 'Could not start the camera. Please try again.';
}

export async function startBarcodeScan(containerElement, onResult, onError) {
  containerElement.innerHTML = '';
  const readerDiv = document.createElement('div');
  readerDiv.id = READER_ELEMENT_ID;
  containerElement.appendChild(readerDiv);

  scannerInstance = new Html5Qrcode(READER_ELEMENT_ID, { formatsToSupport: FORMATS });

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 150 },
  };

  const onScanSuccess = (decodedText) => {
    stopBarcodeScan().finally(() => onResult(decodedText));
  };

  const onScanFailure = () => {
    // Fires every frame with no decode; intentionally a no-op.
  };

  try {
    let cameraId = { facingMode: 'environment' };
    try {
      const cameras = await Html5Qrcode.getCameras();
      const rearCamera = cameras.find((c) => /back|rear|environment/i.test(c.label));
      if (rearCamera) {
        cameraId = rearCamera.id;
      }
    } catch {
      // Camera enumeration may fail before permission is granted; fall back to facingMode constraint.
    }

    await scannerInstance.start(cameraId, config, onScanSuccess, onScanFailure);
  } catch (error) {
    onError(classifyError(error));
  }
}

export async function stopBarcodeScan() {
  if (!scannerInstance) return;
  try {
    await scannerInstance.stop();
    await scannerInstance.clear();
  } catch {
    // Scanner may already be stopped; ignore.
  } finally {
    scannerInstance = null;
  }
}
