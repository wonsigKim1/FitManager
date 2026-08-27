/**
 * FitManager Controller v6 (Figma Layout Sync & Robust OCR)
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = new FitPoseEngine();

  let currentUnit = 'cm';
  let frontImageLoaded = false;
  let sideImageLoaded = false;
  let frontRawDataUrl = '';
  let sideRawDataUrl = '';
  let frontCroppedDataUrl = '';
  let sideCroppedDataUrl = '';

  let frontLandmarksData = null;
  let sideLandmarksData = null;
  let originalFrontData = null;
  let originalSideData = null;
  let currentAnalysisResult = null;

  // Custom Chart
  let customChartData = JSON.parse(localStorage.getItem('fitmanager_custom_chart') || 'null');

  // Dragging State
  let activeCanvasSide = null;
  let draggingPinId = null;
  let hoveredFrontPinId = null;
  let hoveredSidePinId = null;

  // DOM Elements
  const frontInput = document.getElementById('frontInput');
  const sideInput = document.getElementById('sideInput');
  const frontEmptyState = document.getElementById('front-empty-state');
  const sideEmptyState = document.getElementById('side-empty-state');
  const frontPreviewContainer = document.getElementById('front-preview-container');
  const sidePreviewContainer = document.getElementById('side-preview-container');
  const frontPreviewImg = document.getElementById('frontPreviewImg');
  const sidePreviewImg = document.getElementById('sidePreviewImg');
  const frontCropBtn = document.getElementById('frontCropBtn');
  const sideCropBtn = document.getElementById('sideCropBtn');
  const frontRemoveBtn = document.getElementById('frontRemoveBtn');
  const sideRemoveBtn = document.getElementById('sideRemoveBtn');

  const step1Container = document.getElementById('step1-container');
  const step2Container = document.getElementById('step2-container');
  const step3Results = document.getElementById('step3-results');

  const stepBadge1 = document.getElementById('step-badge-1');
  const stepBadge2 = document.getElementById('step-badge-2');
  const stepBadge3 = document.getElementById('step-badge-3');
  const stepLine1 = document.getElementById('step-line-1');
  const stepLine2 = document.getElementById('step-line-2');

  const heightInput = document.getElementById('heightInput');
  const heightValidation = document.getElementById('heightValidation');
  const measureBtn = document.getElementById('measureBtn');
  const sampleBtn = document.getElementById('sampleBtn');
  const reMeasureBtn = document.getElementById('reMeasureBtn');
  const copySummaryBtn = document.getElementById('copySummaryBtn');
  const resetPinsBtn = document.getElementById('resetPinsBtn');

  // Unit Toggles (Figma Container.png layout)
  const unitCmBtn = document.getElementById('unitCmBtn');
  const unitInchBtn = document.getElementById('unitInchBtn');
  const resultHeightUnit = document.getElementById('resultHeightUnit');

  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingStatusText = document.getElementById('loadingStatusText');
  const loadingSubText = document.getElementById('loadingSubText');

  const resultUserHeight = document.getElementById('resultUserHeight');
  const metricRoll = document.getElementById('metricRoll');
  const metricYaw = document.getElementById('metricYaw');
  const metricPitch = document.getElementById('metricPitch');
  const metricScale = document.getElementById('metricScale');
  const measurementCardsContainer = document.getElementById('measurementCardsContainer');

  const topsMatrixTable = document.getElementById('topsMatrixTable');
  const bottomsMatrixTable = document.getElementById('bottomsMatrixTable');

  // Custom Chart Button (Figma Container1.png layout)
  const customChartBtn = document.getElementById('customChartBtn');
  const customChartResultSection = document.getElementById('customChartResultSection');
  const customChartTitle = document.getElementById('customChartTitle');
  const customMatrixTable = document.getElementById('customMatrixTable');
  const deleteCustomChartBtn = document.getElementById('deleteCustomChartBtn');

  const interactiveFrontCanvas = document.getElementById('interactiveFrontCanvas');
  const interactiveSideCanvas = document.getElementById('interactiveSideCanvas');
  const frontPinHoverLabel = document.getElementById('frontPinHoverLabel');
  const sidePinHoverLabel = document.getElementById('sidePinHoverLabel');

  // Guide Modal
  const guideModal = document.getElementById('guideModal');
  const guideModalOpenBtn = document.getElementById('guideModalOpenBtn');
  const guideModalCloseBtn = document.getElementById('guideModalCloseBtn');

  guideModalOpenBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
  guideModalCloseBtn.addEventListener('click', () => guideModal.classList.add('hidden'));

  // Custom Chart Modal DOM
  const customChartModal = document.getElementById('customChartModal');
  const customChartModalCloseBtn = document.getElementById('customChartModalCloseBtn');
  const tabManualBtn = document.getElementById('tabManualBtn');
  const tabOcrBtn = document.getElementById('tabOcrBtn');
  const panelManual = document.getElementById('panelManual');
  const panelOcr = document.getElementById('panelOcr');

  const customGarmentName = document.getElementById('customGarmentName');
  const customColumnFormat = document.getElementById('customColumnFormat');
  const customTableHeader = document.getElementById('customTableHeader');
  const customTableBody = document.getElementById('customTableBody');
  const addCustomRowBtn = document.getElementById('addCustomRowBtn');
  const saveCustomChartBtn = document.getElementById('saveCustomChartBtn');

  const ocrDropzone = document.getElementById('ocrDropzone');
  const ocrInput = document.getElementById('ocrInput');
  const ocrLoading = document.getElementById('ocrLoading');

  if (customChartBtn) {
    customChartBtn.addEventListener('click', () => customChartModal.classList.remove('hidden'));
  }
  customChartModalCloseBtn.addEventListener('click', () => customChartModal.classList.add('hidden'));

  tabManualBtn.addEventListener('click', () => {
    tabManualBtn.className = 'flex-1 py-2.5 rounded-xl bg-white text-indigo-700 font-black text-xs shadow-sm transition';
    tabOcrBtn.className = 'flex-1 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs transition';
    panelManual.classList.remove('hidden');
    panelOcr.classList.add('hidden');
  });

  tabOcrBtn.addEventListener('click', () => {
    tabOcrBtn.className = 'flex-1 py-2.5 rounded-xl bg-white text-indigo-700 font-black text-xs shadow-sm transition';
    tabManualBtn.className = 'flex-1 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs transition';
    panelOcr.classList.remove('hidden');
    panelManual.classList.add('hidden');
  });

  // Custom Format change
  customColumnFormat.addEventListener('change', () => {
    const fmt = customColumnFormat.value;
    if (fmt === 'format_kr_tops') {
      customTableHeader.innerHTML = `
        <th class="p-2">사이즈</th>
        <th class="p-2">상체 총장(cm)</th>
        <th class="p-2">어깨 넓이(cm)</th>
        <th class="p-2">가슴단면(cm)</th>
        <th class="p-2">팔 길이(cm)</th>
        <th class="p-2">삭제</th>
      `;
    } else if (fmt === 'format_std_tops') {
      customTableHeader.innerHTML = `
        <th class="p-2">사이즈</th>
        <th class="p-2">어깨 넓이(cm)</th>
        <th class="p-2">가슴둘레(cm)</th>
        <th class="p-2">상체 총장(cm)</th>
        <th class="p-2">팔 길이(cm)</th>
        <th class="p-2">삭제</th>
      `;
    } else {
      customTableHeader.innerHTML = `
        <th class="p-2">사이즈</th>
        <th class="p-2">허리(cm)</th>
        <th class="p-2">엉덩이(cm)</th>
        <th class="p-2">허벅지(cm)</th>
        <th class="p-2">바지총장(cm)</th>
        <th class="p-2">삭제</th>
      `;
    }
  });

  addCustomRowBtn.addEventListener('click', () => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="p-1"><input type="text" placeholder="Size" class="w-16 p-1 text-center font-bold border rounded"></td>
      <td class="p-1"><input type="number" step="0.1" value="0.0" class="w-16 p-1 text-center border rounded"></td>
      <td class="p-1"><input type="number" step="0.1" value="0.0" class="w-16 p-1 text-center border rounded"></td>
      <td class="p-1"><input type="number" step="0.1" value="0.0" class="w-16 p-1 text-center border rounded"></td>
      <td class="p-1"><input type="number" step="0.1" value="0.0" class="w-16 p-1 text-center border rounded"></td>
      <td class="p-1"><button class="text-red-500 font-bold delete-row-btn">✕</button></td>
    `;
    customTableBody.appendChild(tr);
  });

  customTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-row-btn')) {
      e.target.closest('tr').remove();
    }
  });

  saveCustomChartBtn.addEventListener('click', () => {
    const name = customGarmentName.value.trim() || '쇼핑몰 등록 의류';
    const fmt = customColumnFormat.value;
    const rows = [];

    customTableBody.querySelectorAll('tr').forEach(tr => {
      const inputs = tr.querySelectorAll('input');
      if (inputs.length >= 5) {
        const sz = inputs[0].value.trim() || 'FREE';
        const v1 = parseFloat(inputs[1].value) || 0;
        const v2 = parseFloat(inputs[2].value) || 0;
        const v3 = parseFloat(inputs[3].value) || 0;
        const v4 = parseFloat(inputs[4].value) || 0;

        if (fmt === 'format_kr_tops') {
          // v1: Length, v2: Shoulder, v3: Chest Half-width, v4: Sleeve
          rows.push({ size: sz, length: v1, shoulder: v2, chestHalf: v3, chest: v3 * 2.0, arm: v4 });
        } else if (fmt === 'format_std_tops') {
          // v1: Shoulder, v2: Chest Circ, v3: Length, v4: Sleeve
          rows.push({ size: sz, shoulder: v1, chest: v2, length: v3, arm: v4 });
        } else {
          // v1: Waist, v2: Hip, v3: Thigh, v4: Length
          rows.push({ size: sz, waist: v1, hip: v2, thigh: v3, length: v4 });
        }
      }
    });

    if (rows.length === 0) {
      alert('최소 1개 이상의 사이즈 행을 입력해주세요.');
      return;
    }

    customChartData = { name, format: fmt, rows, type: fmt.includes('bottoms') ? 'bottoms' : 'tops' };
    localStorage.setItem('fitmanager_custom_chart', JSON.stringify(customChartData));
    customChartModal.classList.add('hidden');
    alert(`'${name}' 치수표가 저장되었습니다. 실시간 착용 매칭 분석을 시작합니다.`);

    if (currentAnalysisResult) renderAnalysisDashboard(currentAnalysisResult);
  });

  deleteCustomChartBtn.addEventListener('click', () => {
    if (confirm('등록된 치수표를 삭제하시겠습니까?')) {
      customChartData = null;
      localStorage.removeItem('fitmanager_custom_chart');
      customChartResultSection.classList.add('hidden');
    }
  });

  // OCR Upload Handler
  ocrDropzone.addEventListener('click', () => ocrInput.click());
  ocrInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (ev) => {
        ocrLoading.classList.remove('hidden');
        const b64 = ev.target.result;
        const res = await engine.ocrSizeChart(b64);
        ocrLoading.classList.add('hidden');

        if (res && res.success && res.rows && res.rows.length > 0) {
          customTableBody.innerHTML = '';
          customColumnFormat.value = 'format_kr_tops'; // Default shopping mall format
          customColumnFormat.dispatchEvent(new Event('change'));

          res.rows.forEach(r => {
            const tr = document.createElement('tr');
            const v1 = r.values[0] || 0;
            const v2 = r.values[1] || 0;
            const v3 = r.values[2] || 0;
            const v4 = r.values[3] || 0;

            tr.innerHTML = `
              <td class="p-1"><input type="text" value="${r.size}" class="w-16 p-1 text-center font-bold border rounded"></td>
              <td class="p-1"><input type="number" step="0.1" value="${v1}" class="w-16 p-1 text-center border rounded"></td>
              <td class="p-1"><input type="number" step="0.1" value="${v2}" class="w-16 p-1 text-center border rounded"></td>
              <td class="p-1"><input type="number" step="0.1" value="${v3}" class="w-16 p-1 text-center border rounded"></td>
              <td class="p-1"><input type="number" step="0.1" value="${v4}" class="w-16 p-1 text-center border rounded"></td>
              <td class="p-1"><button class="text-red-500 font-bold delete-row-btn">✕</button></td>
            `;
            customTableBody.appendChild(tr);
          });
          tabManualBtn.click();
          alert(`OCR로 ${res.rows.length}개 사이즈 행을 성공적으로 추출했습니다! 수치와 열 순서를 확인 후 저장해주세요.`);
        } else {
          alert('사진에서 표 수치를 명확히 인식하지 못했습니다. 직접 입력 탭에서 작성해주세요.');
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Crop & Rotate Modal DOM
  const cropModal = document.getElementById('cropModal');
  const cropModalTitle = document.getElementById('cropModalTitle');
  const cropCanvas = document.getElementById('cropCanvas');
  const cropCancelBtn = document.getElementById('cropCancelBtn');
  const cropResetBtn = document.getElementById('cropResetBtn');
  const cropFitBodyBtn = document.getElementById('cropFitBodyBtn');
  const cropConfirmBtn = document.getElementById('cropConfirmBtn');

  const rotateCCWBtn = document.getElementById('rotateCCWBtn');
  const rotateCWBtn = document.getElementById('rotateCWBtn');
  const fineRotateSlider = document.getElementById('fineRotateSlider');
  const rotateAngleVal = document.getElementById('rotateAngleVal');

  let cropSourceImg = new Image();
  let isCroppingFront = true;
  let currentRotationDeg = 0;
  let currentZoom = 1.0;
  let cropPan = { x: 0, y: 0 };
  let cropBox = { x: 0.15, y: 0.05, w: 0.70, h: 0.90 };
  let isDraggingCrop = false;
  let cropDragMode = null;
  let cropStartMouse = { x: 0, y: 0, clientX: 0, clientY: 0 };
  let cropStartBox = { x: 0, y: 0, w: 0, h: 0 };
  let cropStartPan = { x: 0, y: 0 };

  // -------------------------------------------------------------
  // 1. File Upload & Crop Trigger
  // -------------------------------------------------------------
  function handleFileSelect(file, isFront) {
    if (!file || !file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (isFront) {
        frontRawDataUrl = dataUrl;
        openCropModal(dataUrl, true);
      } else {
        sideRawDataUrl = dataUrl;
        openCropModal(dataUrl, false);
      }
    };
    reader.readAsDataURL(file);
  }

  frontInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0], true);
  });

  sideInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0], false);
  });

  frontCropBtn.addEventListener('click', () => {
    if (frontRawDataUrl) openCropModal(frontRawDataUrl, true);
  });

  sideCropBtn.addEventListener('click', () => {
    if (sideRawDataUrl) openCropModal(sideRawDataUrl, false);
  });

  frontRemoveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    frontInput.value = '';
    frontRawDataUrl = '';
    frontCroppedDataUrl = '';
    frontPreviewImg.src = '';
    frontEmptyState.classList.remove('hidden');
    frontPreviewContainer.classList.add('hidden');
    frontImageLoaded = false;
    checkStep2Activation();
  });

  sideRemoveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sideInput.value = '';
    sideRawDataUrl = '';
    sideCroppedDataUrl = '';
    sidePreviewImg.src = '';
    sideEmptyState.classList.remove('hidden');
    sidePreviewContainer.classList.add('hidden');
    sideImageLoaded = false;
    checkStep2Activation();
  });

  // Sample 1-Click Test
  sampleBtn.addEventListener('click', () => {
    const currentGender = document.querySelector('input[name="gender"]:checked')?.value || 'men';
    const samples = window.FitSampleData.getSampleImages(currentGender);
    frontRawDataUrl = samples.front;
    frontCroppedDataUrl = samples.front;
    frontPreviewImg.src = samples.front;
    frontEmptyState.classList.add('hidden');
    frontPreviewContainer.classList.remove('hidden');
    frontImageLoaded = true;

    sideRawDataUrl = samples.side;
    sideCroppedDataUrl = samples.side;
    sidePreviewImg.src = samples.side;
    sideEmptyState.classList.add('hidden');
    sidePreviewContainer.classList.remove('hidden');
    sideImageLoaded = true;

    heightInput.value = '176.5';
    checkStep2Activation();
    step2Container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  function checkStep2Activation() {
    if (frontImageLoaded && sideImageLoaded) {
      step2Container.classList.remove('opacity-40', 'pointer-events-none', 'scale-95');
      step2Container.classList.add('opacity-100', 'scale-100');
      stepBadge2.classList.remove('bg-slate-200', 'text-slate-500');
      stepBadge2.classList.add('bg-blue-600', 'text-white', 'shadow');
      stepLine1.classList.remove('bg-slate-200');
      stepLine1.classList.add('bg-blue-600');
    } else {
      step2Container.classList.add('opacity-40', 'pointer-events-none', 'scale-95');
      step2Container.classList.remove('opacity-100', 'scale-100');
      stepBadge2.classList.add('bg-slate-200', 'text-slate-500');
      stepBadge2.classList.remove('bg-blue-600', 'text-white', 'shadow');
      stepLine1.classList.add('bg-slate-200');
      stepLine1.classList.remove('bg-blue-600');
    }
  }

  // -------------------------------------------------------------
  // 2. Auto-Expanding Viewport Crop Logic (세로 길이 자동 확대 크롭)
  // -------------------------------------------------------------
  function openCropModal(imgDataUrl, isFront) {
    isCroppingFront = isFront;
    currentRotationDeg = 0;
    fineRotateSlider.value = 0;
    rotateAngleVal.textContent = '0°';
    currentZoom = 1.0;
    cropPan = { x: 0, y: 0 };
    if (zoomSlider) zoomSlider.value = 1.0;
    if (zoomVal) zoomVal.textContent = '1.0x';

    cropModalTitle.textContent = isFront ? '정면 사진 크롭 및 세로 자동 확대' : '측면 사진 크롭 및 세로 자동 확대';
    cropSourceImg.onload = () => {
      cropBox = { x: 0.15, y: 0.05, w: 0.70, h: 0.90 };
      cropModal.classList.remove('hidden');
      drawCropCanvas();
    };
    cropSourceImg.src = imgDataUrl;
  }

  rotateCCWBtn.addEventListener('click', () => {
    currentRotationDeg = (currentRotationDeg - 90 + 360) % 360;
    fineRotateSlider.value = 0;
    rotateAngleVal.textContent = `${currentRotationDeg}°`;
    drawCropCanvas();
  });

  rotateCWBtn.addEventListener('click', () => {
    currentRotationDeg = (currentRotationDeg + 90) % 360;
    fineRotateSlider.value = 0;
    rotateAngleVal.textContent = `${currentRotationDeg}°`;
    drawCropCanvas();
  });

  fineRotateSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    rotateAngleVal.textContent = `${val > 0 ? '+' : ''}${val}°`;
    drawCropCanvas();
  });

  // Zoom Controls
  const zoomSlider = document.getElementById('zoomSlider');
  const zoomVal = document.getElementById('zoomVal');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');

  if (zoomSlider) {
    zoomSlider.addEventListener('input', (e) => {
      currentZoom = parseFloat(e.target.value);
      if (zoomVal) zoomVal.textContent = currentZoom.toFixed(1) + 'x';
      drawCropCanvas();
    });
  }
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      currentZoom = Math.min(5.0, currentZoom + 0.2);
      if (zoomSlider) zoomSlider.value = currentZoom;
      if (zoomVal) zoomVal.textContent = currentZoom.toFixed(1) + 'x';
      drawCropCanvas();
    });
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      currentZoom = Math.max(1.0, currentZoom - 0.2);
      if (zoomSlider) zoomSlider.value = currentZoom;
      if (zoomVal) zoomVal.textContent = currentZoom.toFixed(1) + 'x';
      drawCropCanvas();
    });
  }

  cropCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    currentZoom = Math.max(1.0, Math.min(5.0, currentZoom + delta));
    if (zoomSlider) zoomSlider.value = currentZoom;
    if (zoomVal) zoomVal.textContent = currentZoom.toFixed(1) + 'x';
    drawCropCanvas();
  }, { passive: false });

  cropCancelBtn.addEventListener('click', () => cropModal.classList.add('hidden'));

  cropResetBtn.addEventListener('click', () => {
    cropBox = { x: 0.05, y: 0.05, w: 0.90, h: 0.90 };
    currentZoom = 1.0;
    cropPan = { x: 0, y: 0 };
    if (zoomSlider) zoomSlider.value = 1.0;
    if (zoomVal) zoomVal.textContent = '1.0x';
    drawCropCanvas();
  });

  cropFitBodyBtn.addEventListener('click', () => {
    // Automatically center and scale the body to fill the vertical viewport
    cropBox = { x: 0.18, y: 0.05, w: 0.64, h: 0.90 };
    currentZoom = 1.75;
    cropPan = { x: 0, y: 0 };
    if (zoomSlider) zoomSlider.value = currentZoom;
    if (zoomVal) zoomVal.textContent = currentZoom.toFixed(1) + 'x';
    drawCropCanvas();
  });

  // Auto-Expand & Perfect Centering Helper:
  // Scales cropped region to fill vertical viewport (0.90 height) and ALWAYS centers the crop box & image together!
  function autoExpandCroppedRegion() {
    if (!cropBox || cropBox.h <= 0.05 || cropBox.w <= 0.05) return;
    
    // Target height is 90% of the canvas viewport
    const targetH = 0.90;
    const scale = targetH / cropBox.h;

    const cw = cropCanvas.width || 600;
    const ch = cropCanvas.height || 900;

    const boxCenterX = (cropBox.x + cropBox.w / 2.0);
    const boxCenterY = (cropBox.y + cropBox.h / 2.0);

    // Center offset from viewport center (0.5, 0.5) in canvas pixels
    const centerDx = (boxCenterX - 0.5) * cw;
    const centerDy = (boxCenterY - 0.5) * ch;

    // Transform pan and zoom so cropped area & image move directly to the center
    cropPan.x = (cropPan.x - centerDx) * scale;
    cropPan.y = (cropPan.y - centerDy) * scale;
    currentZoom = Math.max(1.0, Math.min(8.0, currentZoom * scale));

    if (zoomSlider) zoomSlider.value = currentZoom;
    if (zoomVal) zoomVal.textContent = currentZoom.toFixed(1) + 'x';

    // The crop box is now ALWAYS perfectly centered horizontally & vertically!
    const newH = targetH;
    const newW = Math.min(0.92, Math.max(0.12, cropBox.w * scale));
    cropBox.h = newH;
    cropBox.w = newW;
    cropBox.x = (1.0 - newW) / 2.0;
    cropBox.y = (1.0 - newH) / 2.0;

    drawCropCanvas();
  }

    cropConfirmBtn.addEventListener('click', () => {
    const rot = currentRotationDeg + parseFloat(fineRotateSlider.value);
    const rad = rot * Math.PI / 180;

    const sw = cropSourceImg.naturalWidth || 600;
    const sh = cropSourceImg.naturalHeight || 900;

    const absCos = Math.abs(Math.cos(rad));
    const absSin = Math.abs(Math.sin(rad));
    const cw = sw * absCos + sh * absSin;
    const ch = sw * absSin + sh * absCos;

    const rotCanvas = document.createElement('canvas');
    rotCanvas.width = cw;
    rotCanvas.height = ch;
    const rCtx = rotCanvas.getContext('2d');

    rCtx.translate(cw / 2 + cropPan.x, ch / 2 + cropPan.y);
    rCtx.rotate(rad);
    rCtx.scale(currentZoom, currentZoom);
    rCtx.drawImage(cropSourceImg, -sw / 2, -sh / 2);

    const cropX = Math.max(0, cropBox.x * cw);
    const cropY = Math.max(0, cropBox.y * ch);
    const cropW = Math.min(cw - cropX, cropBox.w * cw);
    const cropH = Math.min(ch - cropY, cropBox.h * ch);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = cropW;
    outCanvas.height = cropH;
    const outCtx = outCanvas.getContext('2d');
    outCtx.drawImage(rotCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const croppedUrl = outCanvas.toDataURL('image/jpeg', 0.95);
    if (isCroppingFront) {
      frontCroppedDataUrl = croppedUrl;
      frontPreviewImg.src = croppedUrl;
      frontEmptyState.classList.add('hidden');
      frontPreviewContainer.classList.remove('hidden');
      frontImageLoaded = true;
    } else {
      sideCroppedDataUrl = croppedUrl;
      sidePreviewImg.src = croppedUrl;
      sideEmptyState.classList.add('hidden');
      sidePreviewContainer.classList.remove('hidden');
      sideImageLoaded = true;
    }

    cropModal.classList.add('hidden');
    checkStep2Activation();
  });

  function drawCropCanvas() {
    const rot = currentRotationDeg + parseFloat(fineRotateSlider.value);
    const rad = rot * Math.PI / 180;
    const sw = cropSourceImg.naturalWidth || 600;
    const sh = cropSourceImg.naturalHeight || 900;

    const absCos = Math.abs(Math.cos(rad));
    const absSin = Math.abs(Math.sin(rad));
    const cw = sw * absCos + sh * absSin;
    const ch = sw * absSin + sh * absCos;

    cropCanvas.width = cw;
    cropCanvas.height = ch;
    const ctx = cropCanvas.getContext('2d');

    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.translate(cw / 2 + cropPan.x, ch / 2 + cropPan.y);
    ctx.rotate(rad);
    ctx.scale(currentZoom, currentZoom);
    ctx.drawImage(cropSourceImg, -sw / 2, -sh / 2);
    ctx.restore();

    const bx = cropBox.x * cw;
    const by = cropBox.y * ch;
    const bw = cropBox.w * cw;
    const bh = cropBox.h * ch;

    // Dark backdrop overlay outside crop box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.fillRect(0, 0, cw, by);
    ctx.fillRect(0, by, bx, bh);
    ctx.fillRect(bx + bw, by, cw - (bx + bw), bh);
    ctx.fillRect(0, by + bh, cw, ch - (by + bh));

    // High-contrast cyan crop boundary
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(bx, by, bw, bh);

    // 3x3 Rule-of-Thirds Alignment Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx + bw / 3, by);
    ctx.lineTo(bx + bw / 3, by + bh);
    ctx.moveTo(bx + (bw * 2) / 3, by);
    ctx.lineTo(bx + (bw * 2) / 3, by + bh);
    ctx.moveTo(bx, by + bh / 3);
    ctx.lineTo(bx + bw, by + bh / 3);
    ctx.moveTo(bx, by + (bh * 2) / 3);
    ctx.lineTo(bx + bw, by + (bh * 2) / 3);
    ctx.stroke();

    // Body Landmark Guide Tags
    const drawGuideLine = (yPos, color, textLabel) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(bx, yPos);
      ctx.lineTo(bx + bw, yPos);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = 'bold 11px Pretendard, sans-serif';
      const tw = ctx.measureText(textLabel).width;
      ctx.fillRect(bx + 8, yPos - 18, tw + 10, 16);
      ctx.fillStyle = '#000000';
      ctx.fillText(textLabel, bx + 13, yPos - 6);
    };

    // Head Ellipse
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(bx + bw / 2, by + bh * 0.11, bw * 0.18, bh * 0.08, 0, 0, Math.PI * 2);
    ctx.stroke();

    drawGuideLine(by + bh * 0.20, '#facc15', '[ 어깨선 ]');
    drawGuideLine(by + bh * 0.29, '#ff007f', '[ 가슴선 ]');
    drawGuideLine(by + bh * 0.42, '#00ff88', '[ 허리선 ]');
    drawGuideLine(by + bh * 0.54, '#d946ef', '[ 골반/엉덩이 ]');
    drawGuideLine(by + bh * 0.94, '#38bdf8', '[ 발바닥 기준 ]');

    // 8 Drag Handles (4 Corners + 4 Edges)
    ctx.fillStyle = '#00f0ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    const hs = Math.max(9, cw * 0.016);
    const corners = [
      [bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh],
      [bx + bw / 2, by], [bx + bw, by + bh / 2], [bx + bw / 2, by + bh], [bx, by + bh / 2]
    ];
    corners.forEach(([c_x, c_y]) => {
      ctx.beginPath();
      ctx.arc(c_x, c_y, hs, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  cropCanvas.addEventListener('pointerdown', (e) => {
    const rect = cropCanvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width);
    const my = ((e.clientY - rect.top) / rect.height);

    isDraggingCrop = true;
    cropStartMouse = { x: mx, y: my, clientX: e.clientX, clientY: e.clientY };
    cropStartBox = { ...cropBox };
    cropStartPan = { ...cropPan };

    const handleThreshold = 0.05;
    if (Math.hypot(mx - cropBox.x, my - cropBox.y) < handleThreshold) cropDragMode = 'nw';
    else if (Math.hypot(mx - (cropBox.x + cropBox.w), my - cropBox.y) < handleThreshold) cropDragMode = 'ne';
    else if (Math.hypot(mx - (cropBox.x + cropBox.w), my - (cropBox.y + cropBox.h)) < handleThreshold) cropDragMode = 'se';
    else if (Math.hypot(mx - cropBox.x, my - (cropBox.y + cropBox.h)) < handleThreshold) cropDragMode = 'sw';
    else if (Math.abs(my - cropBox.y) < handleThreshold && mx >= cropBox.x && mx <= cropBox.x + cropBox.w) cropDragMode = 'n';
    else if (Math.abs(my - (cropBox.y + cropBox.h)) < handleThreshold && mx >= cropBox.x && mx <= cropBox.x + cropBox.w) cropDragMode = 's';
    else if (Math.abs(mx - cropBox.x) < handleThreshold && my >= cropBox.y && my <= cropBox.y + cropBox.h) cropDragMode = 'w';
    else if (Math.abs(mx - (cropBox.x + cropBox.w)) < handleThreshold && my >= cropBox.y && my <= cropBox.y + cropBox.h) cropDragMode = 'e';
    else if (mx >= cropBox.x && mx <= cropBox.x + cropBox.w && my >= cropBox.y && my <= cropBox.y + cropBox.h) cropDragMode = 'pan';
    else cropDragMode = 'move';
    cropCanvas.setPointerCapture(e.pointerId);
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDraggingCrop) return;
    const rect = cropCanvas.getBoundingClientRect();
    const mx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const my = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const dx = mx - cropStartMouse.x;
    const dy = my - cropStartMouse.y;
    const clientDx = e.clientX - cropStartMouse.clientX;
    const clientDy = e.clientY - cropStartMouse.clientY;

    if (cropDragMode === 'pan') {
      const cw = cropCanvas.width || 600;
      const ch = cropCanvas.height || 900;
      cropPan.x = cropStartPan.x + (clientDx * (cw / rect.width));
      cropPan.y = cropStartPan.y + (clientDy * (ch / rect.height));
    } else if (cropDragMode === 'move') {
      cropBox.x = Math.max(0, Math.min(1 - cropStartBox.w, cropStartBox.x + dx));
      cropBox.y = Math.max(0, Math.min(1 - cropStartBox.h, cropStartBox.y + dy));
    } else if (cropDragMode === 'se') {
      cropBox.w = Math.max(0.1, Math.min(1 - cropBox.x, cropStartBox.w + dx));
      cropBox.h = Math.max(0.1, Math.min(1 - cropBox.y, cropStartBox.h + dy));
    } else if (cropDragMode === 'nw') {
      const newX = Math.max(0, Math.min(cropStartBox.x + cropStartBox.w - 0.1, cropStartBox.x + dx));
      const newY = Math.max(0, Math.min(cropStartBox.y + cropStartBox.h - 0.1, cropStartBox.y + dy));
      cropBox.w = (cropStartBox.x + cropStartBox.w) - newX;
      cropBox.h = (cropStartBox.y + cropStartBox.h) - newY;
      cropBox.x = newX;
      cropBox.y = newY;
    } else if (cropDragMode === 'ne') {
      const newY = Math.max(0, Math.min(cropStartBox.y + cropStartBox.h - 0.1, cropStartBox.y + dy));
      cropBox.w = Math.max(0.1, Math.min(1 - cropStartBox.x, cropStartBox.w + dx));
      cropBox.h = (cropStartBox.y + cropStartBox.h) - newY;
      cropBox.y = newY;
    } else if (cropDragMode === 'sw') {
      const newX = Math.max(0, Math.min(cropStartBox.x + cropStartBox.w - 0.1, cropStartBox.x + dx));
      cropBox.w = (cropStartBox.x + cropStartBox.w) - newX;
      cropBox.h = Math.max(0.1, Math.min(1 - cropStartBox.y, cropStartBox.h + dy));
      cropBox.x = newX;
    } else if (cropDragMode === 's') {
      cropBox.h = Math.max(0.1, Math.min(1 - cropStartBox.y, cropStartBox.h + dy));
    } else if (cropDragMode === 'e') {
      cropBox.w = Math.max(0.1, Math.min(1 - cropStartBox.x, cropStartBox.w + dx));
    } else if (cropDragMode === 'n') {
      const newY = Math.max(0, Math.min(cropStartBox.y + cropStartBox.h - 0.1, cropStartBox.y + dy));
      cropBox.h = (cropStartBox.y + cropStartBox.h) - newY;
      cropBox.y = newY;
    } else if (cropDragMode === 'w') {
      const newX = Math.max(0, Math.min(cropStartBox.x + cropStartBox.w - 0.1, cropStartBox.x + dx));
      cropBox.w = (cropStartBox.x + cropStartBox.w) - newX;
      cropBox.x = newX;
    }
    drawCropCanvas();
  });

  window.addEventListener('pointerup', () => {
    if (isDraggingCrop) {
      const wasResize = cropDragMode && ['nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w', 'move'].includes(cropDragMode);
      isDraggingCrop = false;
      cropDragMode = null;
      
      // If the user finished resizing or moving the crop box, automatically expand it to fill the vertical viewport!
      if (wasResize) {
        autoExpandCroppedRegion();
      }
    }
  });

  // -------------------------------------------------------------
  // 3. Unit Toggle (CM <-> INCH)
  // -------------------------------------------------------------
  unitCmBtn.addEventListener('click', () => {
    if (currentUnit === 'cm') return;
    currentUnit = 'cm';
    unitCmBtn.className = 'px-5 py-2 rounded-xl bg-blue-600 text-white font-black text-sm shadow-md transition-all';
    unitInchBtn.className = 'px-5 py-2 rounded-xl text-slate-400 hover:text-slate-800 font-black text-sm transition-all';
    resultHeightUnit.textContent = 'cm';
    if (currentAnalysisResult) renderAnalysisDashboard(currentAnalysisResult);
  });

  unitInchBtn.addEventListener('click', () => {
    if (currentUnit === 'inch') return;
    currentUnit = 'inch';
    unitInchBtn.className = 'px-5 py-2 rounded-xl bg-blue-600 text-white font-black text-sm shadow-md transition-all';
    unitCmBtn.className = 'px-5 py-2 rounded-xl text-slate-400 hover:text-slate-800 font-black text-sm transition-all';
    resultHeightUnit.textContent = 'in';
    if (currentAnalysisResult) renderAnalysisDashboard(currentAnalysisResult);
  });

  function toUnit(cmVal) {
    if (currentUnit === 'inch') {
      return (cmVal / 2.54).toFixed(1);
    }
    return cmVal.toFixed(1);
  }

  function getUnitLabel() {
    return currentUnit === 'inch' ? 'in' : 'cm';
  }

  // -------------------------------------------------------------
  // 4. Execution & AI Analysis Pipeline
  // -------------------------------------------------------------
  measureBtn.addEventListener('click', async () => {
    const heightVal = parseFloat(heightInput.value);
    if (isNaN(heightVal) || heightVal < 50 || heightVal > 250) {
      heightValidation.classList.remove('hidden');
      heightInput.focus();
      return;
    }
    heightValidation.classList.add('hidden');
    const genderVal = document.querySelector('input[name="gender"]:checked').value;

    loadingOverlay.classList.remove('hidden');
    loadingStatusText.textContent = '인체 3D 키포인트 추출 중...';
    loadingSubText.textContent = '정면 너비와 측면 두께를 결합하여 실시간 3D 둘레를 계산하고 있습니다.';

    try {
      const frontB64 = frontCroppedDataUrl || frontRawDataUrl;
      const sideB64 = sideCroppedDataUrl || sideRawDataUrl;

      const res = await engine.analyzeBody(frontB64, sideB64, heightVal, genderVal);

      frontLandmarksData = JSON.parse(JSON.stringify(res.front));
      sideLandmarksData = JSON.parse(JSON.stringify(res.side));
      originalFrontData = JSON.parse(JSON.stringify(res.front));
      originalSideData = JSON.parse(JSON.stringify(res.side));

      currentAnalysisResult = res;

      renderAnalysisDashboard(currentAnalysisResult);

      stepBadge3.classList.remove('bg-slate-200', 'text-slate-500');
      stepBadge3.classList.add('bg-blue-600', 'text-white', 'shadow');
      stepLine2.classList.remove('bg-slate-200');
      stepLine2.classList.add('bg-blue-600');

      loadingOverlay.classList.add('hidden');
      step3Results.classList.remove('hidden');
      step3Results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      loadingOverlay.classList.add('hidden');
      console.error(err);
      alert('체형 측정 중 오류가 발생했습니다. 사진을 확인해 주세요.');
    }
  });

  function renderAnalysisDashboard(res) {
    const uLabel = getUnitLabel();
    resultUserHeight.textContent = toUnit(res.userHeight);

    metricRoll.textContent = `${res.metrics.rollDeg > 0 ? '+' : ''}${res.metrics.rollDeg}° 보정`;
    metricYaw.textContent = `${res.metrics.yawFactor}x 역투영`;
    metricPitch.textContent = `${res.metrics.pitchFactor}x 원근수정`;
    metricScale.textContent = `${res.metrics.scaleCmPerPx} cm/px`;

    // Render 8 Measurement Cards
    measurementCardsContainer.innerHTML = '';
    const m = res.measurements;
    Object.keys(m).forEach((key, idx) => {
      const item = m[key];
      const card = document.createElement('div');
      card.className = 'bg-white rounded-3xl border border-slate-200 p-4 shadow-sm card-hover-effect flex flex-col justify-between space-y-3';
      
      let extraBadge = '';
      if (item.circ) {
        extraBadge = `<div class="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg inline-block">둘레 ≈ ${toUnit(item.circ)} ${uLabel}</div>`;
      } else if (item.inseam) {
        extraBadge = `<div class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">안쪽길이 ≈ ${toUnit(item.inseam)} ${uLabel}</div>`;
      }

      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-2.5">
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shadow-inner">
              <i class="ph-bold ${item.icon}"></i>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 block tracking-wider">ITEM 0${idx + 1}</span>
              <h4 class="font-black text-slate-900 text-sm">${item.name}</h4>
            </div>
          </div>
        </div>

        <div class="space-y-1">
          <div class="flex items-baseline space-x-1">
            <span class="text-3xl font-black text-slate-900 tracking-tight">${toUnit(item.value)}</span>
            <span class="text-xs font-bold text-slate-400">${uLabel}</span>
          </div>
          ${extraBadge}
        </div>

        <div class="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
          <i class="ph ph-info text-blue-500"></i>
          <span>${item.desc}</span>
        </div>
      `;
      measurementCardsContainer.appendChild(card);
    });

    // Render Matrix Tables with Wearable Fit Logic (Spec >= Body)
    renderUniqloMatrixTables(res);

    // Render Custom Chart if present
    renderCustomMatrixTable(res);

    redrawInteractiveCanvases();
  }

  // -------------------------------------------------------------
  // 5. Uniqlo Size Matrix (Wearable Condition: Spec >= Body)
  // -------------------------------------------------------------
  function renderUniqloMatrixTables(res) {
    const gender = res.gender || 'men';
    const chart = gender === 'men' ? engine.uniqloChartMen : engine.uniqloChartWomen;
    const uLabel = getUnitLabel();

    const m = res.measurements;
    const myShoulder = m.shoulderWidth.value;
    const myChest = m.chestWidth.circ;
    const myTorso = m.torsoLength.value;
    const myArm = m.armLength.value;

    const myWaist = m.waistWidth.circ;
    const myHip = m.hipWidth.circ;
    const myThigh = m.thighWidth.value;
    const myLeg = m.legLength.value;

    const bestSh = engine.findWearableSize(chart.tops, 'shoulder', myShoulder);
    const bestCh = engine.findWearableSize(chart.tops, 'chest', myChest);
    const bestTo = engine.findWearableSize(chart.tops, 'length', myTorso);
    const bestAr = engine.findWearableSize(chart.tops, 'arm', myArm);

    let topsHtml = `
      <thead class="bg-slate-50 text-slate-600 text-[11px] font-black uppercase">
        <tr>
          <th class="py-3 px-3">사이즈</th>
          <th class="py-3 px-3">어깨 넓이 (${uLabel})</th>
          <th class="py-3 px-3">가슴 둘레 (${uLabel})</th>
          <th class="py-3 px-3">상체 총장 (${uLabel})</th>
          <th class="py-3 px-3">소매 길이 (${uLabel})</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 text-xs">
    `;

    chart.tops.forEach((row) => {
      const shMatch = (row.size === bestSh.size);
      const chMatch = (row.size === bestCh.size);
      const toMatch = (row.size === bestTo.size);
      const arMatch = (row.size === bestAr.size);

      const cellContent = (val, bodyVal, isBest, matchObj) => {
        if (isBest) {
          const mText = matchObj.margin >= 0 ? `+${toUnit(matchObj.margin)}${uLabel}` : `타이트`;
          return `<div class="py-1 px-1.5 bg-emerald-50 text-emerald-800 font-black border-2 border-emerald-400 rounded-lg shadow-sm">${toUnit(val)} <span class="text-[10px] ml-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">추천 (${mText})</span></div>`;
        } else if (val < bodyVal) {
          return `<div class="py-1 px-1.5 text-slate-400 font-medium">${toUnit(val)} <span class="text-[9px] text-red-400">(작음)</span></div>`;
        } else {
          return `<div class="py-1 px-1.5 text-slate-700 font-semibold">${toUnit(val)}</div>`;
        }
      };

      topsHtml += `
        <tr class="hover:bg-slate-50/80 transition">
          <td class="py-3 px-3 font-black text-slate-900 bg-slate-50/50">${row.size}</td>
          <td class="py-2 px-2.5">${cellContent(row.shoulder, myShoulder, shMatch, bestSh)}</td>
          <td class="py-2 px-2.5">${cellContent(row.chest, myChest, chMatch, bestCh)}</td>
          <td class="py-2 px-2.5">${cellContent(row.length, myTorso, toMatch, bestTo)}</td>
          <td class="py-2 px-2.5">${cellContent(row.arm, myArm, arMatch, bestAr)}</td>
        </tr>
      `;
    });
    topsHtml += '</tbody>';
    topsMatrixTable.innerHTML = topsHtml;

    const bestWa = engine.findWearableSize(chart.bottoms, 'waist', myWaist);
    const bestHi = engine.findWearableSize(chart.bottoms, 'hip', myHip);
    const bestTh = engine.findWearableSize(chart.bottoms, 'thigh', myThigh);
    const bestLe = engine.findWearableSize(chart.bottoms, 'length', myLeg);

    let bottomsHtml = `
      <thead class="bg-slate-50 text-slate-600 text-[11px] font-black uppercase">
        <tr>
          <th class="py-3 px-3">사이즈</th>
          <th class="py-3 px-3">허리 둘레 (inch / ${uLabel})</th>
          <th class="py-3 px-3">엉덩이 둘레 (${uLabel})</th>
          <th class="py-3 px-3">허벅지 너비 (${uLabel})</th>
          <th class="py-3 px-3">바지 총장 (${uLabel})</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 text-xs">
    `;

    chart.bottoms.forEach((row) => {
      const waMatch = (row.size === bestWa.size);
      const hiMatch = (row.size === bestHi.size);
      const thMatch = (row.size === bestTh.size);
      const leMatch = (row.size === bestLe.size);

      const cellContent = (val, bodyVal, isBest, matchObj, isWaist = false) => {
        const displayVal = isWaist ? `${row.waistInch}in (${toUnit(val)}${uLabel})` : `${toUnit(val)}`;
        if (isBest) {
          const mText = matchObj.margin >= 0 ? `+${toUnit(matchObj.margin)}${uLabel}` : `타이트`;
          return `<div class="py-1 px-1.5 bg-emerald-50 text-emerald-800 font-black border-2 border-emerald-400 rounded-lg shadow-sm">${displayVal} <span class="text-[10px] ml-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">추천 (${mText})</span></div>`;
        } else if (val < bodyVal) {
          return `<div class="py-1 px-1.5 text-slate-400 font-medium">${displayVal} <span class="text-[9px] text-red-400">(작음)</span></div>`;
        } else {
          return `<div class="py-1 px-1.5 text-slate-700 font-semibold">${displayVal}</div>`;
        }
      };

      bottomsHtml += `
        <tr class="hover:bg-slate-50/80 transition">
          <td class="py-3 px-3 font-black text-slate-900 bg-slate-50/50">${row.size}</td>
          <td class="py-2 px-2.5">${cellContent(row.waist, myWaist, waMatch, bestWa, true)}</td>
          <td class="py-2 px-2.5">${cellContent(row.hip, myHip, hiMatch, bestHi)}</td>
          <td class="py-2 px-2.5">${cellContent(row.thigh, myThigh, thMatch, bestTh)}</td>
          <td class="py-2 px-2.5">${cellContent(row.length, myLeg, leMatch, bestLe)}</td>
        </tr>
      `;
    });
    bottomsHtml += '</tbody>';
    bottomsMatrixTable.innerHTML = bottomsHtml;
  }

  // -------------------------------------------------------------
  // 6. Custom Chart Evaluation Matrix
  // -------------------------------------------------------------
  function renderCustomMatrixTable(res) {
    if (!customChartData || !customChartData.rows || customChartData.rows.length === 0) {
      customChartResultSection.classList.add('hidden');
      return;
    }

    customChartResultSection.classList.remove('hidden');
    customChartTitle.textContent = `등록된 '${customChartData.name}' 치수표 분석 결과`;
    const uLabel = getUnitLabel();
    const isTops = customChartData.type === 'tops';

    const m = res.measurements;
    let html = isTops ? `
      <thead class="bg-indigo-50 text-indigo-950 text-[11px] font-black uppercase">
        <tr>
          <th class="py-3 px-3">사이즈</th>
          <th class="py-3 px-3">어깨 (${uLabel})</th>
          <th class="py-3 px-3">가슴 둘레 (${uLabel})</th>
          <th class="py-3 px-3">총장 (${uLabel})</th>
          <th class="py-3 px-3">소매 (${uLabel})</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 text-xs">
    ` : `
      <thead class="bg-indigo-50 text-indigo-950 text-[11px] font-black uppercase">
        <tr>
          <th class="py-3 px-3">사이즈</th>
          <th class="py-3 px-3">허리 (${uLabel})</th>
          <th class="py-3 px-3">엉덩이 (${uLabel})</th>
          <th class="py-3 px-3">허벅지 (${uLabel})</th>
          <th class="py-3 px-3">바지총장 (${uLabel})</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 text-xs">
    `;

    if (isTops) {
      const bestSh = engine.findWearableSize(customChartData.rows, 'shoulder', m.shoulderWidth.value);
      const bestCh = engine.findWearableSize(customChartData.rows, 'chest', m.chestWidth.circ);
      const bestTo = engine.findWearableSize(customChartData.rows, 'length', m.torsoLength.value);
      const bestAr = engine.findWearableSize(customChartData.rows, 'arm', m.armLength.value);

      customChartData.rows.forEach(r => {
        const shMatch = (r.size === bestSh.size);
        const chMatch = (r.size === bestCh.size);
        const toMatch = (r.size === bestTo.size);
        const arMatch = (r.size === bestAr.size);

        const cell = (val, bodyVal, isBest, matchObj) => {
          if (isBest) {
            const mText = matchObj.margin >= 0 ? `+${toUnit(matchObj.margin)}${uLabel}` : `타이트`;
            return `<div class="py-1 px-1.5 bg-emerald-50 text-emerald-800 font-black border-2 border-emerald-400 rounded-lg shadow-sm">${toUnit(val)} <span class="text-[10px] ml-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">추천 (${mText})</span></div>`;
          } else if (val < bodyVal) {
            return `<div class="py-1 px-1.5 text-slate-400 font-medium">${toUnit(val)} <span class="text-[9px] text-red-400">(작음)</span></div>`;
          } else {
            return `<div class="py-1 px-1.5 text-slate-700 font-semibold">${toUnit(val)}</div>`;
          }
        };

        html += `
          <tr class="hover:bg-indigo-50/40 transition">
            <td class="py-3 px-3 font-black text-indigo-900 bg-indigo-50/30">${r.size}</td>
            <td class="py-2 px-2.5">${cell(r.shoulder, m.shoulderWidth.value, shMatch, bestSh)}</td>
            <td class="py-2 px-2.5">${cell(r.chest, m.chestWidth.circ, chMatch, bestCh)}</td>
            <td class="py-2 px-2.5">${cell(r.length, m.torsoLength.value, toMatch, bestTo)}</td>
            <td class="py-2 px-2.5">${cell(r.arm, m.armLength.value, arMatch, bestAr)}</td>
          </tr>
        `;
      });
    } else {
      const bestWa = engine.findWearableSize(customChartData.rows, 'waist', m.waistWidth.circ);
      const bestHi = engine.findWearableSize(customChartData.rows, 'hip', m.hipWidth.circ);
      const bestTh = engine.findWearableSize(customChartData.rows, 'thigh', m.thighWidth.value);
      const bestLe = engine.findWearableSize(customChartData.rows, 'length', m.legLength.value);

      customChartData.rows.forEach(r => {
        const waMatch = (r.size === bestWa.size);
        const hiMatch = (r.size === bestHi.size);
        const thMatch = (r.size === bestTh.size);
        const leMatch = (r.size === bestLe.size);

        const cell = (val, bodyVal, isBest, matchObj) => {
          if (isBest) {
            const mText = matchObj.margin >= 0 ? `+${toUnit(matchObj.margin)}${uLabel}` : `타이트`;
            return `<div class="py-1 px-1.5 bg-emerald-50 text-emerald-800 font-black border-2 border-emerald-400 rounded-lg shadow-sm">${toUnit(val)} <span class="text-[10px] ml-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">추천 (${mText})</span></div>`;
          } else if (val < bodyVal) {
            return `<div class="py-1 px-1.5 text-slate-400 font-medium">${toUnit(val)} <span class="text-[9px] text-red-400">(작음)</span></div>`;
          } else {
            return `<div class="py-1 px-1.5 text-slate-700 font-semibold">${toUnit(val)}</div>`;
          }
        };

        html += `
          <tr class="hover:bg-indigo-50/40 transition">
            <td class="py-3 px-3 font-black text-indigo-900 bg-indigo-50/30">${r.size}</td>
            <td class="py-2 px-2.5">${cell(r.waist, m.waistWidth.circ, waMatch, bestWa)}</td>
            <td class="py-2 px-2.5">${cell(r.hip, m.hipWidth.circ, hiMatch, bestHi)}</td>
            <td class="py-2 px-2.5">${cell(r.thigh, m.thighWidth.value, thMatch, bestTh)}</td>
            <td class="py-2 px-2.5">${cell(r.length, m.legLength.value, leMatch, bestLe)}</td>
          </tr>
        `;
      });
    }
    html += '</tbody>';
    customMatrixTable.innerHTML = html;
  }

  function redrawInteractiveCanvases() {
    if (frontLandmarksData) {
      engine.drawInteractiveCanvas(
        interactiveFrontCanvas,
        frontPreviewImg,
        frontLandmarksData,
        false,
        activeCanvasSide === 'front' ? draggingPinId : null,
        hoveredFrontPinId
      );
    }
    if (sideLandmarksData) {
      engine.drawInteractiveCanvas(
        interactiveSideCanvas,
        sidePreviewImg,
        sideLandmarksData,
        true,
        activeCanvasSide === 'side' ? draggingPinId : null,
        hoveredSidePinId
      );
    }
  }

  // -------------------------------------------------------------
  // 7. Interactive Pin Dragging
  // -------------------------------------------------------------
  function findClosestPinId(canvas, dataObj, mouseX, mouseY, isSide) {
    if (!dataObj) return null;
    let closestId = null;
    let minDist = 0.08;

    const keyPinIndices = isSide ? [0, 11, 13, 15, 23, 25, 27, 29] : [0, 11, 12, 13, 14, 15, 16, 25, 26, 27, 28, 29, 30];
    keyPinIndices.forEach((idx) => {
      const pt = dataObj.landmarks[idx];
      if (!pt) return;
      const d = Math.hypot(pt.x - mouseX, pt.y - mouseY);
      if (d < minDist) {
        minDist = d;
        closestId = idx;
      }
    });

    if (dataObj.customPins) {
      Object.keys(dataObj.customPins).forEach((k) => {
        const pt = dataObj.customPins[k];
        if (!pt) return;
        const d = Math.hypot(pt.x - mouseX, pt.y - mouseY);
        if (d < minDist) {
          minDist = d;
          closestId = k;
        }
      });
    }

    return closestId;
  }

  interactiveFrontCanvas.addEventListener('pointerdown', (e) => {
    const rect = interactiveFrontCanvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    const hit = findClosestPinId(interactiveFrontCanvas, frontLandmarksData, mx, my, false);
    if (hit !== null) {
      activeCanvasSide = 'front';
      draggingPinId = hit;
      interactiveFrontCanvas.setPointerCapture(e.pointerId);
    }
  });

  interactiveFrontCanvas.addEventListener('pointermove', (e) => {
    const rect = interactiveFrontCanvas.getBoundingClientRect();
    const mx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const my = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    if (activeCanvasSide === 'front' && draggingPinId !== null) {
      if (typeof draggingPinId === 'number') {
        frontLandmarksData.landmarks[draggingPinId].x = mx;
        frontLandmarksData.landmarks[draggingPinId].y = my;
      } else if (frontLandmarksData.customPins && frontLandmarksData.customPins[draggingPinId]) {
        frontLandmarksData.customPins[draggingPinId].x = mx;
        frontLandmarksData.customPins[draggingPinId].y = my;
      }
      liveRecalculate();
    } else {
      const hit = findClosestPinId(interactiveFrontCanvas, frontLandmarksData, mx, my, false);
      hoveredFrontPinId = hit ? String(hit) : null;
      if (hit !== null) {
        frontPinHoverLabel.textContent = engine.landmarkNames[hit] || '관절 점';
        frontPinHoverLabel.classList.remove('hidden');
      } else {
        frontPinHoverLabel.classList.add('hidden');
      }
      redrawInteractiveCanvases();
    }
  });

  interactiveFrontCanvas.addEventListener('pointerup', () => {
    activeCanvasSide = null;
    draggingPinId = null;
    redrawInteractiveCanvases();
  });

  interactiveSideCanvas.addEventListener('pointerdown', (e) => {
    const rect = interactiveSideCanvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    const hit = findClosestPinId(interactiveSideCanvas, sideLandmarksData, mx, my, true);
    if (hit !== null) {
      activeCanvasSide = 'side';
      draggingPinId = hit;
      interactiveSideCanvas.setPointerCapture(e.pointerId);
    }
  });

  interactiveSideCanvas.addEventListener('pointermove', (e) => {
    const rect = interactiveSideCanvas.getBoundingClientRect();
    const mx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const my = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    if (activeCanvasSide === 'side' && draggingPinId !== null) {
      if (typeof draggingPinId === 'number') {
        sideLandmarksData.landmarks[draggingPinId].x = mx;
        sideLandmarksData.landmarks[draggingPinId].y = my;
      } else if (sideLandmarksData.customPins && sideLandmarksData.customPins[draggingPinId]) {
        sideLandmarksData.customPins[draggingPinId].x = mx;
        sideLandmarksData.customPins[draggingPinId].y = my;
      }
      liveRecalculate();
    } else {
      const hit = findClosestPinId(interactiveSideCanvas, sideLandmarksData, mx, my, true);
      hoveredSidePinId = hit ? String(hit) : null;
      if (hit !== null) {
        sidePinHoverLabel.textContent = engine.landmarkNames[hit] || '측면 두께 점';
        sidePinHoverLabel.classList.remove('hidden');
      } else {
        sidePinHoverLabel.classList.add('hidden');
      }
      redrawInteractiveCanvases();
    }
  });

  interactiveSideCanvas.addEventListener('pointerup', () => {
    activeCanvasSide = null;
    draggingPinId = null;
    redrawInteractiveCanvases();
  });

  function liveRecalculate() {
    const heightVal = parseFloat(heightInput.value) || 175.0;
    const genderVal = document.querySelector('input[name="gender"]:checked').value;

    currentAnalysisResult = engine.calculateMeasurements(
      frontLandmarksData,
      sideLandmarksData,
      heightVal,
      genderVal
    );

    renderAnalysisDashboard(currentAnalysisResult);
  }

  resetPinsBtn.addEventListener('click', () => {
    if (originalFrontData) {
      frontLandmarksData = JSON.parse(JSON.stringify(originalFrontData));
    }
    if (originalSideData) {
      sideLandmarksData = JSON.parse(JSON.stringify(originalSideData));
    }
    liveRecalculate();
  });

  reMeasureBtn.addEventListener('click', () => {
    step3Results.classList.add('hidden');
    stepBadge3.classList.add('bg-slate-200', 'text-slate-500');
    stepBadge3.classList.remove('bg-blue-600', 'text-white', 'shadow');
    stepLine2.classList.add('bg-slate-200');
    stepLine2.classList.remove('bg-blue-600');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  copySummaryBtn.addEventListener('click', () => {
    if (!currentAnalysisResult) return;
    const m = currentAnalysisResult.measurements;
    const uLabel = getUnitLabel();
    const summaryText = `[FitManager 3D 체형 분석 리포트]\n` +
      `• 신장: ${toUnit(currentAnalysisResult.userHeight)} ${uLabel}\n` +
      `1. 상체 길이: ${toUnit(m.torsoLength.value)} ${uLabel}\n` +
      `2. 어깨 넓이: ${toUnit(m.shoulderWidth.value)} ${uLabel}\n` +
      `3. 가슴 너비: ${toUnit(m.chestWidth.value)} ${uLabel} (둘레: ${toUnit(m.chestWidth.circ)} ${uLabel})\n` +
      `4. 팔 길이: ${toUnit(m.armLength.value)} ${uLabel}\n` +
      `5. 허리 너비: ${toUnit(m.waistWidth.value)} ${uLabel} (둘레: ${toUnit(m.waistWidth.circ)} ${uLabel})\n` +
      `6. 골반 너비: ${toUnit(m.hipWidth.value)} ${uLabel} (둘레: ${toUnit(m.hipWidth.circ)} ${uLabel})\n` +
      `7. 허벅지 너비: ${toUnit(m.thighWidth.value)} ${uLabel} (둘레: ${toUnit(m.thighWidth.circ)} ${uLabel})\n` +
      `8. 다리 총기장: ${toUnit(m.legLength.value)} ${uLabel} (안쪽길이: ${toUnit(m.legLength.inseam)} ${uLabel})\n` +
      `[산출 기준: 정면 폭 + 측면 두께 3D 라마누잔 둘레 및 착용 보장(Spec >= Body) 사이즈 추천]`;

    navigator.clipboard.writeText(summaryText).then(() => {
      alert('체형 측정 결과 요약이 클립보드에 복사되었습니다.');
    }).catch(() => {
      alert('복사에 실패했습니다.');
    });
  });



  // -------------------------------------------------------------
  // 8. Large-Scale Focus Modal (포인트 정밀 수정 전용 대형 모달 - 순수 캔버스 집중 모드)
  // -------------------------------------------------------------
  const focusEditModal = document.getElementById('focusEditModal');
  const focusCanvas = document.getElementById('focusCanvas');
  const focusModalTitle = document.getElementById('focusModalTitle');
  const focusModalSideBadge = document.getElementById('focusModalSideBadge');
  const focusModalPinHoverBadge = document.getElementById('focusModalPinHoverBadge');
  const focusModalResetBtn = document.getElementById('focusModalResetBtn');
  const focusModalCloseBtn = document.getElementById('focusModalCloseBtn');
  const openFrontFocusBtn = document.getElementById('openFrontFocusBtn');
  const openSideFocusBtn = document.getElementById('openSideFocusBtn');
  const canvasFrontExpandBtn = document.getElementById('canvasFrontExpandBtn');
  const canvasSideExpandBtn = document.getElementById('canvasSideExpandBtn');
  const frontCanvasCard = document.getElementById('frontCanvasCard');
  const sideCanvasCard = document.getElementById('sideCanvasCard');

  let currentFocusSide = 'front';
  let isFocusModalDragging = false;
  let hoveredFocusPinId = null;

  function openFocusModal(side) {
    currentFocusSide = side;
    if (side === 'front') {
      focusModalTitle.textContent = '정면 (너비 폭 계측)';
      focusModalSideBadge.className = 'bg-blue-600 text-white text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-black shadow-md flex items-center gap-1.5';
    } else {
      focusModalTitle.textContent = '측면 (앞뒤 두께 계측)';
      focusModalSideBadge.className = 'bg-indigo-600 text-white text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-black shadow-md flex items-center gap-1.5';
    }
    if (focusModalPinHoverBadge) focusModalPinHoverBadge.classList.add('hidden');
    if (focusEditModal) focusEditModal.classList.remove('hidden');
    redrawFocusCanvas();
  }

  function closeFocusModal() {
    if (focusEditModal) focusEditModal.classList.add('hidden');
    redrawInteractiveCanvases();
    if (currentAnalysisResult) renderAnalysisDashboard(currentAnalysisResult);
  }

  // Direct Click Listeners to open modal on any canvas / card interaction
  if (frontCanvasCard) frontCanvasCard.addEventListener('click', (e) => openFocusModal('front'));
  if (sideCanvasCard) sideCanvasCard.addEventListener('click', (e) => openFocusModal('side'));
  if (interactiveFrontCanvas) interactiveFrontCanvas.addEventListener('click', (e) => openFocusModal('front'));
  if (interactiveSideCanvas) interactiveSideCanvas.addEventListener('click', (e) => openFocusModal('side'));
  if (openFrontFocusBtn) openFrontFocusBtn.addEventListener('click', () => openFocusModal('front'));
  if (openSideFocusBtn) openSideFocusBtn.addEventListener('click', () => openFocusModal('side'));
  if (canvasFrontExpandBtn) canvasFrontExpandBtn.addEventListener('click', () => openFocusModal('front'));
  if (canvasSideExpandBtn) canvasSideExpandBtn.addEventListener('click', () => openFocusModal('side'));

  if (focusModalCloseBtn) focusModalCloseBtn.addEventListener('click', closeFocusModal);
  if (focusModalResetBtn) focusModalResetBtn.addEventListener('click', () => {
    if (originalFrontData) frontLandmarksData = JSON.parse(JSON.stringify(originalFrontData));
    if (originalSideData) sideLandmarksData = JSON.parse(JSON.stringify(originalSideData));
    liveRecalculate();
    redrawFocusCanvas();
  });

  function redrawFocusCanvas() {
    if (!focusCanvas) return;
    const isSide = currentFocusSide === 'side';
    const targetImg = isSide ? sidePreviewImg : frontPreviewImg;
    const targetData = isSide ? sideLandmarksData : frontLandmarksData;

    if (targetImg && targetData) {
      engine.drawInteractiveCanvas(
        focusCanvas,
        targetImg,
        targetData,
        isSide,
        draggingPinId,
        hoveredFocusPinId
      );
    }
  }

  if (focusCanvas) {
    focusCanvas.addEventListener('pointerdown', (e) => {
      const isSide = currentFocusSide === 'side';
      const dataObj = isSide ? sideLandmarksData : frontLandmarksData;
      const rect = focusCanvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      const hit = findClosestPinId(focusCanvas, dataObj, mx, my, isSide);
      if (hit !== null) {
        isFocusModalDragging = true;
        activeCanvasSide = currentFocusSide;
        draggingPinId = hit;
        focusCanvas.setPointerCapture(e.pointerId);
      }
    });

    focusCanvas.addEventListener('pointermove', (e) => {
      const isSide = currentFocusSide === 'side';
      const dataObj = isSide ? sideLandmarksData : frontLandmarksData;
      const rect = focusCanvas.getBoundingClientRect();
      const mx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const my = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      if (isFocusModalDragging && draggingPinId !== null) {
        if (typeof draggingPinId === 'number') {
          dataObj.landmarks[draggingPinId].x = mx;
          dataObj.landmarks[draggingPinId].y = my;
        } else if (dataObj.customPins && dataObj.customPins[draggingPinId]) {
          dataObj.customPins[draggingPinId].x = mx;
          dataObj.customPins[draggingPinId].y = my;
        }
        liveRecalculate();
        redrawFocusCanvas();
      } else {
        const hit = findClosestPinId(focusCanvas, dataObj, mx, my, isSide);
        hoveredFocusPinId = hit ? String(hit) : null;
        if (hit !== null) {
          focusModalPinHoverBadge.textContent = engine.landmarkNames[hit] || '관절 점';
          focusModalPinHoverBadge.classList.remove('hidden');
        } else {
          focusModalPinHoverBadge.classList.add('hidden');
        }
        redrawFocusCanvas();
      }
    });

    focusCanvas.addEventListener('pointerup', () => {
      isFocusModalDragging = false;
      draggingPinId = null;
      activeCanvasSide = null;
      redrawFocusCanvas();
      redrawInteractiveCanvases();
    });
  }

});

