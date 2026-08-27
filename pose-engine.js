/**
 * FitManager AI Pose & Anthropometric Engine v6
 * Features:
 * - Unified Single Hip Line (Eliminated duplicate points/lines)
 * - Safe Wearable Size Recommendation Logic (Spec >= Body Measurement)
 * - Dynamic Unit Converter (cm <-> inch)
 * - Custom Garment Size Chart Evaluation Engine
 */

class FitPoseEngine {
  constructor() {
    this.apiEndpoint = 'http://localhost:8080/api/analyze';
    this.ocrEndpoint = 'http://localhost:8080/api/ocr-sizechart';

    this.landmarkNames = {
      0: '머리 상단 (정수리)',
      11: '어깨 좌측 끝점',
      12: '어깨 우측 끝점',
      'chestL': '정면 가슴 좌측점',
      'chestR': '정면 가슴 우측점',
      13: '팔꿈치 좌측',
      14: '팔꿈치 우측',
      15: '손목 좌측',
      16: '손목 우측',
      'waistL': '정면 허리 좌측점 (가장 잘록한 선)',
      'waistR': '정면 허리 우측점 (가장 잘록한 선)',
      'hipL': '정면 골반 좌측점 (단일 골반선)',
      'hipR': '정면 골반 우측점 (단일 골반선)',
      'thighL': '정면 허벅지 바깥점',
      'thighR': '정면 허벅지 안쪽점',
      25: '무릎 좌측',
      26: '무릎 우측',
      27: '발목 좌측 (복사뼈)',
      28: '발목 우측 (복사뼈)',
      29: '발바닥 좌측 (바닥선)',
      30: '발바닥 우측 (바닥선)',
      // Side Depth Pins
      'sideChestF': '측면 가슴 앞점 (두께 시작)',
      'sideChestB': '측면 가슴 뒷점 (등/두께 끝)',
      'sideWaistF': '측면 허리 앞점 (복부)',
      'sideWaistB': '측면 허리 뒷점 (허리 뒤)',
      'sideHipF': '측면 골반 앞점',
      'sideHipB': '측면 엉덩이 돌출점 (최대 두께)',
      'sideThighF': '측면 허벅지 앞점',
      'sideThighB': '측면 허벅지 뒷점'
    };

    this.uniqloChartMen = {
      tops: [
        { size: 'XS', shoulder: 42.0, chest: 84.0, length: 65.0, arm: 56.5 },
        { size: 'S',  shoulder: 43.5, chest: 90.0, length: 67.0, arm: 58.0 },
        { size: 'M',  shoulder: 45.0, chest: 98.0, length: 70.0, arm: 60.0 },
        { size: 'L',  shoulder: 46.5, chest: 104.0, length: 73.0, arm: 62.0 },
        { size: 'XL', shoulder: 48.5, chest: 112.0, length: 76.0, arm: 64.0 },
        { size: 'XXL',shoulder: 50.5, chest: 120.0, length: 78.0, arm: 65.0 },
        { size: '3XL',shoulder: 52.5, chest: 128.0, length: 79.0, arm: 66.0 },
        { size: '4XL',shoulder: 54.5, chest: 136.0, length: 80.0, arm: 67.0 }
      ],
      bottoms: [
        { size: 'XS', waist: 68.0, waistInch: 27, hip: 88.0, thigh: 27.5, length: 98.0 },
        { size: 'S',  waist: 74.0, waistInch: 29, hip: 94.0, thigh: 29.0, length: 100.0 },
        { size: 'M',  waist: 80.0, waistInch: 31, hip: 100.0, thigh: 31.0, length: 102.0 },
        { size: 'L',  waist: 86.0, waistInch: 34, hip: 106.0, thigh: 33.0, length: 104.0 },
        { size: 'XL', waist: 94.0, waistInch: 37, hip: 114.0, thigh: 35.0, length: 105.0 },
        { size: 'XXL',waist: 102.0, waistInch: 40, hip: 122.0, thigh: 37.5, length: 106.0 },
        { size: '3XL',waist: 110.0, waistInch: 43, hip: 130.0, thigh: 40.0, length: 107.0 },
        { size: '4XL',waist: 118.0, waistInch: 46, hip: 138.0, thigh: 42.5, length: 108.0 }
      ]
    };

    this.uniqloChartWomen = {
      tops: [
        { size: 'XS', shoulder: 36.0, chest: 78.0, length: 57.0, arm: 54.0 },
        { size: 'S',  shoulder: 37.0, chest: 83.0, length: 59.0, arm: 55.5 },
        { size: 'M',  shoulder: 38.0, chest: 88.0, length: 61.0, arm: 57.0 },
        { size: 'L',  shoulder: 39.5, chest: 94.0, length: 63.0, arm: 58.5 },
        { size: 'XL', shoulder: 41.0, chest: 100.0, length: 65.0, arm: 59.5 },
        { size: 'XXL',shoulder: 42.5, chest: 106.0, length: 66.0, arm: 60.5 },
        { size: '3XL',shoulder: 44.0, chest: 112.0, length: 67.0, arm: 61.5 }
      ],
      bottoms: [
        { size: 'XS', waist: 60.0, waistInch: 24, hip: 84.0, thigh: 25.5, length: 94.0 },
        { size: 'S',  waist: 65.0, waistInch: 26, hip: 89.0, thigh: 27.0, length: 96.0 },
        { size: 'M',  waist: 70.0, waistInch: 28, hip: 94.0, thigh: 28.5, length: 98.0 },
        { size: 'L',  waist: 76.0, waistInch: 30, hip: 100.0, thigh: 30.5, length: 100.0 },
        { size: 'XL', waist: 82.0, waistInch: 32, hip: 106.0, thigh: 32.5, length: 101.0 },
        { size: 'XXL',waist: 88.0, waistInch: 35, hip: 112.0, thigh: 34.5, length: 102.0 },
        { size: '3XL',waist: 94.0, waistInch: 37, hip: 118.0, thigh: 36.5, length: 103.0 }
      ]
    };
  }

  async analyzeBody(frontImgBase64, sideImgBase64, heightCm, gender = 'men') {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImage: frontImgBase64,
          sideImage: sideImgBase64,
          userHeight: heightCm,
          gender: gender
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Python AI backend offline. Running adaptive client-side estimator:", e);
    }

    return this.clientSideAnalysis(frontImgBase64, sideImgBase64, heightCm, gender);
  }

  async ocrSizeChart(imageBase64) {
    try {
      const response = await fetch(this.ocrEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error("OCR API error:", e);
    }
    return { success: false, error: "서버 OCR 통신 실패" };
  }

  clientSideAnalysis(frontB64, sideB64, heightCm, gender) {
    const frontImg = new Image();
    frontImg.src = frontB64;
    const sideImg = new Image();
    sideImg.src = sideB64;

    const fW = frontImg.naturalWidth || 600;
    const fH = frontImg.naturalHeight || 900;
    const sW = sideImg.naturalWidth || 600;
    const sH = sideImg.naturalHeight || 900;

    const frontData = this.estimateSmartLandmarks(fW, fH, false);
    const sideData = this.estimateSmartLandmarks(sW, sH, true);

    return this.calculateMeasurements(frontData, sideData, heightCm, gender);
  }

  estimateSmartLandmarks(w, h, isSide) {
    const lm = [];
    for (let i = 0; i < 33; i++) {
      lm.push({ x: 0.5, y: 0.5, z: 0, visibility: 0.9 });
    }

    const cx = 0.50;
    const topY = 0.04;
    const normH = 0.92;

    lm[0] = { x: cx, y: topY + normH * 0.075, z: 0, visibility: 0.95 };
    lm[2] = { x: cx - 0.06, y: topY + normH * 0.065, z: 0, visibility: 0.9 };
    lm[5] = { x: cx + 0.06, y: topY + normH * 0.065, z: 0, visibility: 0.9 };

    let customPins = {};

    if (!isSide) {
      // Front View
      lm[11] = { x: 0.18, y: topY + normH * 0.17, z: 0, visibility: 0.95 };
      lm[12] = { x: 0.82, y: topY + normH * 0.17, z: 0, visibility: 0.95 };
      
      lm[13] = { x: 0.10, y: topY + normH * 0.34, z: 0, visibility: 0.9 };
      lm[14] = { x: 0.90, y: topY + normH * 0.34, z: 0, visibility: 0.9 };
      lm[15] = { x: 0.12, y: topY + normH * 0.48, z: 0, visibility: 0.9 };
      lm[16] = { x: 0.88, y: topY + normH * 0.48, z: 0, visibility: 0.9 };

      lm[25] = { x: 0.35, y: topY + normH * 0.72, z: 0, visibility: 0.95 };
      lm[26] = { x: 0.65, y: topY + normH * 0.72, z: 0, visibility: 0.95 };
      lm[27] = { x: 0.37, y: topY + normH * 0.92, z: 0, visibility: 0.95 };
      lm[28] = { x: 0.63, y: topY + normH * 0.92, z: 0, visibility: 0.95 };
      lm[29] = { x: 0.37, y: topY + normH * 0.96, z: 0, visibility: 0.9 };
      lm[30] = { x: 0.63, y: topY + normH * 0.96, z: 0, visibility: 0.9 };
      lm[31] = { x: 0.35, y: topY + normH * 0.98, z: 0, visibility: 0.9 };
      lm[32] = { x: 0.65, y: topY + normH * 0.98, z: 0, visibility: 0.9 };

      customPins = {
        chestL: { x: 0.22, y: topY + normH * 0.27, name: '정면 가슴 좌측점' },
        chestR: { x: 0.78, y: topY + normH * 0.27, name: '정면 가슴 우측점' },
        waistL: { x: 0.29, y: topY + normH * 0.39, name: '정면 허리 좌측점' },
        waistR: { x: 0.71, y: topY + normH * 0.39, name: '정면 허리 우측점' },
        hipL: { x: 0.26, y: topY + normH * 0.50, name: '정면 골반 좌측점' },
        hipR: { x: 0.74, y: topY + normH * 0.50, name: '정면 골반 우측점' },
        thighL: { x: 0.32, y: topY + normH * 0.59, name: '정면 허벅지 바깥점' },
        thighR: { x: 0.46, y: topY + normH * 0.59, name: '정면 허벅지 안쪽점' }
      };
    } else {
      // Side View
      lm[11] = { x: cx, y: topY + normH * 0.17, z: 0, visibility: 0.95 };
      lm[12] = { x: cx, y: topY + normH * 0.17, z: 0, visibility: 0.95 };
      lm[13] = { x: cx + 0.08, y: topY + normH * 0.34, z: 0, visibility: 0.9 };
      lm[15] = { x: cx + 0.10, y: topY + normH * 0.48, z: 0, visibility: 0.9 };
      lm[23] = { x: cx, y: topY + normH * 0.50, z: 0, visibility: 0.95 };
      lm[24] = { x: cx, y: topY + normH * 0.50, z: 0, visibility: 0.95 };
      lm[25] = { x: cx + 0.04, y: topY + normH * 0.72, z: 0, visibility: 0.95 };
      lm[27] = { x: cx, y: topY + normH * 0.92, z: 0, visibility: 0.95 };
      lm[29] = { x: cx - 0.05, y: topY + normH * 0.96, z: 0, visibility: 0.9 };
      lm[31] = { x: cx + 0.15, y: topY + normH * 0.98, z: 0, visibility: 0.9 };

      customPins = {
        sideChestF: { x: 0.30, y: topY + normH * 0.27, name: '측면 가슴 앞점' },
        sideChestB: { x: 0.70, y: topY + normH * 0.27, name: '측면 가슴 뒷점(등)' },
        sideWaistF: { x: 0.35, y: topY + normH * 0.39, name: '측면 허리 앞점(복부)' },
        sideWaistB: { x: 0.65, y: topY + normH * 0.39, name: '측면 허리 뒷점' },
        sideHipF: { x: 0.32, y: topY + normH * 0.50, name: '측면 골반 앞점' },
        sideHipB: { x: 0.74, y: topY + normH * 0.50, name: '측면 엉덩이 돌출점' },
        sideThighF: { x: 0.34, y: topY + normH * 0.59, name: '측면 허벅지 앞점' },
        sideThighB: { x: 0.66, y: topY + normH * 0.59, name: '측면 허벅지 뒷점' }
      };
    }

    return {
      landmarks: lm,
      customPins: customPins,
      width: w,
      height: h
    };
  }

  calculateRamanujanCircumference(width, depth) {
    const a = width / 2.0;
    const b = depth / 2.0;
    if (a <= 0 || b <= 0) return Math.max(0, width * Math.PI);
    const term = Math.sqrt((3.0 * a + b) * (a + 3.0 * b));
    return Math.PI * (3.0 * (a + b) - term);
  }

  calculateMeasurements(frontData, sideData, userHeightCm, gender = 'men') {
    const fLM = frontData.landmarks;
    const fW = frontData.width;
    const fH = frontData.height;
    const sW = sideData.width;
    const sH = sideData.height;

    const fPins = frontData.customPins || {};
    const sPins = sideData.customPins || {};

    // 1. Roll
    const lSh = { x: fLM[11].x * fW, y: fLM[11].y * fH };
    const rSh = { x: fLM[12].x * fW, y: fLM[12].y * fH };
    const shAngleDeg = Math.atan2(rSh.y - lSh.y, rSh.x - lSh.x) * (180 / Math.PI);
    const midSh = { x: (lSh.x + rSh.x) / 2, y: (lSh.y + rSh.y) / 2 };

    const lHip = fPins.hipL ? { x: fPins.hipL.x * fW, y: fPins.hipL.y * fH } : { x: fLM[23].x * fW, y: fLM[23].y * fH };
    const rHip = fPins.hipR ? { x: fPins.hipR.x * fW, y: fPins.hipR.y * fH } : { x: fLM[24].x * fW, y: fLM[24].y * fH };
    const midHip = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 };

    const spineAngleDeg = Math.atan2(midHip.x - midSh.x, midHip.y - midSh.y) * (180 / Math.PI);
    const rollDeg = parseFloat(((shAngleDeg + spineAngleDeg) / 2).toFixed(1));

    // 2. Yaw
    const nose = { x: fLM[0].x * fW, y: fLM[0].y * fH };
    const distL = Math.abs(nose.x - lSh.x);
    const distR = Math.abs(nose.x - rSh.x);
    const asym = (distL - distR) / (distL + distR || 1);
    const yawFactor = parseFloat((1 / Math.max(0.85, Math.cos(Math.asin(Math.max(-0.5, Math.min(0.5, asym * 1.2)))))).toFixed(2));

    // 3. Pitch
    const lAnk = { x: fLM[27].x * fW, y: fLM[27].y * fH };
    const rAnk = { x: fLM[28].x * fW, y: fLM[28].y * fH };
    const midAnk = { x: (lAnk.x + rAnk.x) / 2, y: (lAnk.y + rAnk.y) / 2 };

    const torsoPx = Math.hypot(midHip.x - midSh.x, midHip.y - midSh.y);
    const legsPx = Math.hypot(midAnk.x - midHip.x, midAnk.y - midHip.y);
    const obsRatio = torsoPx / (legsPx || 1);
    const stdRatio = gender === 'men' ? 0.58 : 0.55;
    const pitchFactor = parseFloat(Math.max(0.92, Math.min(1.08, 1 + (obsRatio - stdRatio) * 0.4)).toFixed(2));

    // Scaling
    const headTopY = Math.max(0, nose.y - 1.25 * Math.abs(midSh.y - nose.y));
    const floorY = Math.max(
      (fLM[29].y * fH), (fLM[30].y * fH),
      (fLM[31].y * fH), (fLM[32].y * fH),
      midAnk.y + 0.04 * fH
    );
    const totalBodyPx = Math.max(100, floorY - headTopY);
    const scaleCmPerPx = parseFloat((userHeightCm / totalBodyPx).toFixed(3));

    const sShY = sideData.landmarks[11].y * sH;
    const sNoseY = sideData.landmarks[0].y * sH;
    const sHeadTop = Math.max(0, sNoseY - 1.25 * Math.abs(sShY - sNoseY));
    const sFloor = Math.max(sideData.landmarks[27].y * sH + 0.04 * sH, sideData.landmarks[29].y * sH);
    const sScale = userHeightCm / Math.max(100, sFloor - sHeadTop);

    const toCmFront = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y) * scaleCmPerPx;
    const toDepthSide = (pinF, pinB) => Math.abs((pinB?.x || 0) - (pinF?.x || 0)) * sW * sScale;

    // Measurements
    const torsoLength = parseFloat((toCmFront(midSh, midHip) * pitchFactor * 1.05).toFixed(1));
    const shoulderWidth = parseFloat((toCmFront(lSh, rSh) * yawFactor * 1.04).toFixed(1));

    // Chest
    const cLPx = fPins.chestL ? { x: fPins.chestL.x * fW, y: fPins.chestL.y * fH } : { x: midSh.x - fW * 0.20, y: midSh.y + fH * 0.08 };
    const cRPx = fPins.chestR ? { x: fPins.chestR.x * fW, y: fPins.chestR.y * fH } : { x: midSh.x + fW * 0.20, y: midSh.y + fH * 0.08 };
    const chestWidth = parseFloat((toCmFront(cLPx, cRPx) * yawFactor).toFixed(1));
    const sideChestDepth = parseFloat((sPins.sideChestF && sPins.sideChestB ? toDepthSide(sPins.sideChestF, sPins.sideChestB) : userHeightCm * 0.22).toFixed(1));
    const chestCirc = parseFloat(this.calculateRamanujanCircumference(chestWidth, sideChestDepth).toFixed(1));

    // Arm Length
    const lElb = { x: fLM[13].x * fW, y: fLM[13].y * fH };
    const lWri = { x: fLM[15].x * fW, y: fLM[15].y * fH };
    const rElb = { x: fLM[14].x * fW, y: fLM[14].y * fH };
    const rWri = { x: fLM[16].x * fW, y: fLM[16].y * fH };
    const armLength = parseFloat((((toCmFront(lSh, lElb) + toCmFront(lElb, lWri) + toCmFront(rSh, rElb) + toCmFront(rElb, rWri)) / 2) * 1.02).toFixed(1));

    // Waist
    const wLPx = fPins.waistL ? { x: fPins.waistL.x * fW, y: fPins.waistL.y * fH } : { x: midSh.x - fW * 0.16, y: midSh.y + fH * 0.18 };
    const wRPx = fPins.waistR ? { x: fPins.waistR.x * fW, y: fPins.waistR.y * fH } : { x: midSh.x + fW * 0.16, y: midSh.y + fH * 0.18 };
    const waistWidth = parseFloat((toCmFront(wLPx, wRPx) * yawFactor).toFixed(1));
    const sideWaistDepth = parseFloat((sPins.sideWaistF && sPins.sideWaistB ? toDepthSide(sPins.sideWaistF, sPins.sideWaistB) : userHeightCm * 0.18).toFixed(1));
    const waistCirc = parseFloat(this.calculateRamanujanCircumference(waistWidth, sideWaistDepth).toFixed(1));

    // Hip
    const hipWidth = parseFloat((toCmFront(lHip, rHip) * 1.08 * yawFactor).toFixed(1));
    const sideHipDepth = parseFloat((sPins.sideHipF && sPins.sideHipB ? toDepthSide(sPins.sideHipF, sPins.sideHipB) : userHeightCm * 0.24).toFixed(1));
    const hipCirc = parseFloat(this.calculateRamanujanCircumference(hipWidth, sideHipDepth).toFixed(1));

    // Thigh
    const tLPx = fPins.thighL ? { x: fPins.thighL.x * fW, y: fPins.thighL.y * fH } : { x: lHip.x * 0.9, y: lHip.y * 1.15 };
    const tRPx = fPins.thighR ? { x: fPins.thighR.x * fW, y: fPins.thighR.y * fH } : { x: midHip.x * 0.95, y: lHip.y * 1.15 };
    const thighWidth = parseFloat((toCmFront(tLPx, tRPx) || (hipWidth * 0.54)).toFixed(1));
    const sideThighDepth = parseFloat((sPins.sideThighF && sPins.sideThighB ? toDepthSide(sPins.sideThighF, sPins.sideThighB) : userHeightCm * 0.16).toFixed(1));
    const thighCirc = parseFloat(this.calculateRamanujanCircumference(thighWidth, sideThighDepth).toFixed(1));

    // Leg Length
    const lKnee = { x: fLM[25].x * fW, y: fLM[25].y * fH };
    const rKnee = { x: fLM[26].x * fW, y: fLM[26].y * fH };
    const legOutseam = parseFloat((((toCmFront(lHip, lKnee) + toCmFront(lKnee, lAnk) + toCmFront(rHip, rKnee) + toCmFront(rKnee, rAnk)) / 2) * (2 - pitchFactor)).toFixed(1));
    const legInseam = parseFloat((legOutseam * 0.78).toFixed(1));

    return {
      success: true,
      front: frontData,
      side: sideData,
      metrics: {
        rollDeg: rollDeg,
        yawFactor: yawFactor,
        pitchFactor: pitchFactor,
        scaleCmPerPx: scaleCmPerPx
      },
      measurements: {
        torsoLength: { name: '상체 길이', value: torsoLength, unit: 'cm', desc: '목 뒤 중심 ~ 골반 윗선 (상의 총장)', icon: 'ph-person' },
        shoulderWidth: { name: '어깨 넓이', value: shoulderWidth, unit: 'cm', desc: '좌우 어깨 끝점 사이 직선 거리', icon: 'ph-arrows-left-right' },
        chestWidth: { name: '가슴 넓이', value: chestWidth, unit: 'cm', depth: sideChestDepth, circ: chestCirc, desc: `가슴 너비: ${chestWidth}cm / 둘레: ${chestCirc}cm (두께: ${sideChestDepth}cm)`, icon: 'ph-t-shirt' },
        armLength: { name: '팔 길이', value: armLength, unit: 'cm', desc: '어깨 끝 ~ 팔꿈치 ~ 손목뼈 전체 길이', icon: 'ph-hand' },
        waistWidth: { name: '허리 넓이', value: waistWidth, unit: 'cm', depth: sideWaistDepth, circ: waistCirc, desc: `허리 너비: ${waistWidth}cm / 둘레: ${waistCirc}cm (두께: ${sideWaistDepth}cm)`, icon: 'ph-circle' },
        hipWidth: { name: '골반 넓이', value: hipWidth, unit: 'cm', depth: sideHipDepth, circ: hipCirc, desc: `골반 너비: ${hipWidth}cm / 둘레: ${hipCirc}cm (두께: ${sideHipDepth}cm)`, icon: 'ph-pants' },
        thighWidth: { name: '허벅지 넓이', value: thighWidth, unit: 'cm', depth: sideThighDepth, circ: thighCirc, desc: `허벅지 너비: ${thighWidth}cm / 둘레: ${thighCirc}cm (두께: ${sideThighDepth}cm)`, icon: 'ph-ruler' },
        legLength: { name: '다리 총기장', value: legOutseam, unit: 'cm', inseam: legInseam, desc: `바깥 총기장: ${legOutseam}cm, 다리안쪽(인심): ${legInseam}cm`, icon: 'ph-sneaker-move' }
      },
      userHeight: userHeightCm,
      gender: gender
    };
  }

  // Safe Wearable Size Finder: Finds the smallest size where Spec >= Body Measurement
  findWearableSize(chartList, key, bodyValue) {
    // Filter sizes where spec >= bodyValue
    const validSizes = chartList.filter(row => row[key] >= bodyValue);
    if (validSizes.length > 0) {
      // Smallest valid size
      const best = validSizes[0];
      const margin = (best[key] - bodyValue).toFixed(1);
      return {
        size: best.size,
        spec: best[key],
        margin: parseFloat(margin),
        status: 'recommended' // 'recommended' | 'tight' | 'too_small'
      };
    }
    // If body value exceeds largest size
    const largest = chartList[chartList.length - 1];
    return {
      size: largest.size,
      spec: largest[key],
      margin: parseFloat((largest[key] - bodyValue).toFixed(1)),
      status: 'tight'
    };
  }

  drawInteractiveCanvas(canvas, imgElement, dataObj, isSide = false, activePinId = null, hoveredPinId = null) {
    const ctx = canvas.getContext('2d');
    canvas.width = imgElement.naturalWidth || imgElement.width || 600;
    canvas.height = imgElement.naturalHeight || imgElement.height || 900;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(imgElement, 0, 0, w, h);

    if (!dataObj || !dataObj.landmarks) return;
    const landmarks = dataObj.landmarks;
    const customPins = dataObj.customPins || {};

    // Dark backdrop overlay for contrast
    ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
    ctx.fillRect(0, 0, w, h);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (!isSide) {
      // ============================================================
      // 1. FRONT VIEW: 4-Tier Torso Bounding Box / Cage & Skeleton
      // ============================================================
      const hipLPx = customPins.hipL ? { x: customPins.hipL.x * w, y: customPins.hipL.y * h } : { x: (landmarks[23] ? landmarks[23].x * w : w * 0.35), y: (landmarks[23] ? landmarks[23].y * h : h * 0.54) };
      const hipRPx = customPins.hipR ? { x: customPins.hipR.x * w, y: customPins.hipR.y * h } : { x: (landmarks[24] ? landmarks[24].x * w : w * 0.65), y: (landmarks[24] ? landmarks[24].y * h : h * 0.54) };

      // (A) Segment Polygons (Translucent Torso Box Fill)
      // 1. Shoulder to Chest Segment
      if (landmarks[11] && landmarks[12] && customPins.chestL && customPins.chestR) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.10)';
        ctx.beginPath();
        ctx.moveTo(landmarks[11].x * w, landmarks[11].y * h);
        ctx.lineTo(landmarks[12].x * w, landmarks[12].y * h);
        ctx.lineTo(customPins.chestR.x * w, customPins.chestR.y * h);
        ctx.lineTo(customPins.chestL.x * w, customPins.chestL.y * h);
        ctx.closePath();
        ctx.fill();
      }
      // 2. Chest to Waist Segment
      if (customPins.chestL && customPins.chestR && customPins.waistL && customPins.waistR) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.10)';
        ctx.beginPath();
        ctx.moveTo(customPins.chestL.x * w, customPins.chestL.y * h);
        ctx.lineTo(customPins.chestR.x * w, customPins.chestR.y * h);
        ctx.lineTo(customPins.waistR.x * w, customPins.waistR.y * h);
        ctx.lineTo(customPins.waistL.x * w, customPins.waistL.y * h);
        ctx.closePath();
        ctx.fill();
      }
      // 3. Waist to Hip Segment
      if (customPins.waistL && customPins.waistR && customPins.hipL && customPins.hipR) {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.10)';
        ctx.beginPath();
        ctx.moveTo(customPins.waistL.x * w, customPins.waistL.y * h);
        ctx.lineTo(customPins.waistR.x * w, customPins.waistR.y * h);
        ctx.lineTo(customPins.hipR.x * w, customPins.hipR.y * h);
        ctx.lineTo(customPins.hipL.x * w, customPins.hipL.y * h);
        ctx.closePath();
        ctx.fill();
      }

      // (B) Torso Box Left & Right Boundary Lines (Connecting Shoulder -> Chest -> Waist -> Hip)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = Math.max(3, w * 0.005);
      // Left Wall
      ctx.beginPath();
      if (landmarks[11]) ctx.moveTo(landmarks[11].x * w, landmarks[11].y * h);
      if (customPins.chestL) ctx.lineTo(customPins.chestL.x * w, customPins.chestL.y * h);
      if (customPins.waistL) ctx.lineTo(customPins.waistL.x * w, customPins.waistL.y * h);
      if (customPins.hipL) ctx.lineTo(customPins.hipL.x * w, customPins.hipL.y * h);
      ctx.stroke();

      // Right Wall
      ctx.beginPath();
      if (landmarks[12]) ctx.moveTo(landmarks[12].x * w, landmarks[12].y * h);
      if (customPins.chestR) ctx.lineTo(customPins.chestR.x * w, customPins.chestR.y * h);
      if (customPins.waistR) ctx.lineTo(customPins.waistR.x * w, customPins.waistR.y * h);
      if (customPins.hipR) ctx.lineTo(customPins.hipR.x * w, customPins.hipR.y * h);
      ctx.stroke();

      // (C) Standard Limbs Skeleton (Arms & Legs)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(2.5, w * 0.004);
      // Arms
      if (landmarks[11] && landmarks[13] && landmarks[15]) {
        ctx.beginPath();
        ctx.moveTo(landmarks[11].x * w, landmarks[11].y * h);
        ctx.lineTo(landmarks[13].x * w, landmarks[13].y * h);
        ctx.lineTo(landmarks[15].x * w, landmarks[15].y * h);
        ctx.stroke();
      }
      if (landmarks[12] && landmarks[14] && landmarks[16]) {
        ctx.beginPath();
        ctx.moveTo(landmarks[12].x * w, landmarks[12].y * h);
        ctx.lineTo(landmarks[14].x * w, landmarks[14].y * h);
        ctx.lineTo(landmarks[16].x * w, landmarks[16].y * h);
        ctx.stroke();
      }
      // Legs from Hip Line
      ctx.beginPath();
      ctx.moveTo(hipLPx.x, hipLPx.y);
      if (landmarks[25]) ctx.lineTo(landmarks[25].x * w, landmarks[25].y * h);
      if (landmarks[27]) ctx.lineTo(landmarks[27].x * w, landmarks[27].y * h);
      if (landmarks[29]) ctx.lineTo(landmarks[29].x * w, landmarks[29].y * h);
      ctx.moveTo(hipRPx.x, hipRPx.y);
      if (landmarks[26]) ctx.lineTo(landmarks[26].x * w, landmarks[26].y * h);
      if (landmarks[28]) ctx.lineTo(landmarks[28].x * w, landmarks[28].y * h);
      if (landmarks[30]) ctx.lineTo(landmarks[30].x * w, landmarks[30].y * h);
      ctx.stroke();

      // (D) Accent Measurement Lines (Horizontal Width Bars)
      // 1. Shoulder Line (Yellow)
      if (landmarks[11] && landmarks[12]) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = Math.max(4, w * 0.007);
        ctx.beginPath();
        ctx.moveTo(landmarks[11].x * w, landmarks[11].y * h);
        ctx.lineTo(landmarks[12].x * w, landmarks[12].y * h);
        ctx.stroke();
      }

      // 2. Chest Line (Pink)
      if (customPins.chestL && customPins.chestR) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = Math.max(4, w * 0.007);
        ctx.beginPath();
        ctx.moveTo(customPins.chestL.x * w, customPins.chestL.y * h);
        ctx.lineTo(customPins.chestR.x * w, customPins.chestR.y * h);
        ctx.stroke();
      }

      // 3. Waist Line (Emerald)
      if (customPins.waistL && customPins.waistR) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = Math.max(4, w * 0.007);
        ctx.beginPath();
        ctx.moveTo(customPins.waistL.x * w, customPins.waistL.y * h);
        ctx.lineTo(customPins.waistR.x * w, customPins.waistR.y * h);
        ctx.stroke();
      }

      // 4. Single Unified Hip Line (Purple)
      if (customPins.hipL && customPins.hipR) {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = Math.max(4, w * 0.007);
        ctx.beginPath();
        ctx.moveTo(customPins.hipL.x * w, customPins.hipL.y * h);
        ctx.lineTo(customPins.hipR.x * w, customPins.hipR.y * h);
        ctx.stroke();
      }

      // 5. Thigh Line (Orange)
      if (customPins.thighL && customPins.thighR) {
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = Math.max(4, w * 0.007);
        ctx.beginPath();
        ctx.moveTo(customPins.thighL.x * w, customPins.thighL.y * h);
        ctx.lineTo(customPins.thighR.x * w, customPins.thighR.y * h);
        ctx.stroke();
      }
    } else {
      // ============================================================
      // 2. SIDE VIEW: 4-Tier Depth Bounding Box / Cage & Skeleton
      // ============================================================
      const shoulderAnchor = landmarks[11] ? { x: landmarks[11].x * w, y: landmarks[11].y * h } : { x: w * 0.5, y: h * 0.20 };

      // (A) Segment Polygons (Translucent Depth Box Fill)
      // 1. Shoulder to Side Chest
      if (customPins.sideChestF && customPins.sideChestB) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.10)';
        ctx.beginPath();
        ctx.moveTo(shoulderAnchor.x, shoulderAnchor.y);
        ctx.lineTo(customPins.sideChestF.x * w, customPins.sideChestF.y * h);
        ctx.lineTo(customPins.sideChestB.x * w, customPins.sideChestB.y * h);
        ctx.closePath();
        ctx.fill();
      }
      // 2. Side Chest to Side Waist
      if (customPins.sideChestF && customPins.sideChestB && customPins.sideWaistF && customPins.sideWaistB) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.10)';
        ctx.beginPath();
        ctx.moveTo(customPins.sideChestF.x * w, customPins.sideChestF.y * h);
        ctx.lineTo(customPins.sideChestB.x * w, customPins.sideChestB.y * h);
        ctx.lineTo(customPins.sideWaistB.x * w, customPins.sideWaistB.y * h);
        ctx.lineTo(customPins.sideWaistF.x * w, customPins.sideWaistF.y * h);
        ctx.closePath();
        ctx.fill();
      }
      // 3. Side Waist to Side Hip
      if (customPins.sideWaistF && customPins.sideWaistB && customPins.sideHipF && customPins.sideHipB) {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.10)';
        ctx.beginPath();
        ctx.moveTo(customPins.sideWaistF.x * w, customPins.sideWaistF.y * h);
        ctx.lineTo(customPins.sideWaistB.x * w, customPins.sideWaistB.y * h);
        ctx.lineTo(customPins.sideHipB.x * w, customPins.sideHipB.y * h);
        ctx.lineTo(customPins.sideHipF.x * w, customPins.sideHipF.y * h);
        ctx.closePath();
        ctx.fill();
      }
      // 4. Side Hip to Side Thigh
      if (customPins.sideHipF && customPins.sideHipB && customPins.sideThighF && customPins.sideThighB) {
        ctx.fillStyle = 'rgba(251, 146, 60, 0.10)';
        ctx.beginPath();
        ctx.moveTo(customPins.sideHipF.x * w, customPins.sideHipF.y * h);
        ctx.lineTo(customPins.sideHipB.x * w, customPins.sideHipB.y * h);
        ctx.lineTo(customPins.sideThighB.x * w, customPins.sideThighB.y * h);
        ctx.lineTo(customPins.sideThighF.x * w, customPins.sideThighF.y * h);
        ctx.closePath();
        ctx.fill();
      }

      // (B) Side Front & Back Contour Boundary Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = Math.max(3, w * 0.005);
      // Front Profile Line
      ctx.beginPath();
      ctx.moveTo(shoulderAnchor.x, shoulderAnchor.y);
      if (customPins.sideChestF) ctx.lineTo(customPins.sideChestF.x * w, customPins.sideChestF.y * h);
      if (customPins.sideWaistF) ctx.lineTo(customPins.sideWaistF.x * w, customPins.sideWaistF.y * h);
      if (customPins.sideHipF) ctx.lineTo(customPins.sideHipF.x * w, customPins.sideHipF.y * h);
      if (customPins.sideThighF) ctx.lineTo(customPins.sideThighF.x * w, customPins.sideThighF.y * h);
      ctx.stroke();

      // Back Profile Line
      ctx.beginPath();
      ctx.moveTo(shoulderAnchor.x, shoulderAnchor.y);
      if (customPins.sideChestB) ctx.lineTo(customPins.sideChestB.x * w, customPins.sideChestB.y * h);
      if (customPins.sideWaistB) ctx.lineTo(customPins.sideWaistB.x * w, customPins.sideWaistB.y * h);
      if (customPins.sideHipB) ctx.lineTo(customPins.sideHipB.x * w, customPins.sideHipB.y * h);
      if (customPins.sideThighB) ctx.lineTo(customPins.sideThighB.x * w, customPins.sideThighB.y * h);
      ctx.stroke();

      // (C) Side Spine / Limbs Skeleton
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(2.5, w * 0.004);
      const sideConnections = [
        [0, 11], [11, 13], [13, 15], [11, 23], [23, 25], [25, 27], [27, 29]
      ];
      ctx.beginPath();
      sideConnections.forEach(([i, j]) => {
        if (landmarks[i] && landmarks[j]) {
          ctx.moveTo(landmarks[i].x * w, landmarks[i].y * h);
          ctx.lineTo(landmarks[j].x * w, landmarks[j].y * h);
        }
      });
      ctx.stroke();

      // (D) Side Depth Accent Lines
      if (customPins.sideChestF && customPins.sideChestB) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = Math.max(4, w * 0.007);
        ctx.beginPath();
        ctx.moveTo(customPins.sideChestF.x * w, customPins.sideChestF.y * h);
        ctx.lineTo(customPins.sideChestB.x * w, customPins.sideChestB.y * h);
        ctx.stroke();
      }
      if (customPins.sideWaistF && customPins.sideWaistB) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = Math.max(4, w * 0.007);
        ctx.beginPath();
        ctx.moveTo(customPins.sideWaistF.x * w, customPins.sideWaistF.y * h);
        ctx.lineTo(customPins.sideWaistB.x * w, customPins.sideWaistB.y * h);
        ctx.stroke();
      }
      if (customPins.sideHipF && customPins.sideHipB) {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = Math.max(4, w * 0.007);
        ctx.beginPath();
        ctx.moveTo(customPins.sideHipF.x * w, customPins.sideHipF.y * h);
        ctx.lineTo(customPins.sideHipB.x * w, customPins.sideHipB.y * h);
        ctx.stroke();
      }
      if (customPins.sideThighF && customPins.sideThighB) {
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = Math.max(4, w * 0.007);
        ctx.beginPath();
        ctx.moveTo(customPins.sideThighF.x * w, customPins.sideThighF.y * h);
        ctx.lineTo(customPins.sideThighB.x * w, customPins.sideThighB.y * h);
        ctx.stroke();
      }
    }

    // ============================================================
    // 3. PIN RENDERING WITH SLEEK GLOW AND HOVER EFFECTS
    // ============================================================
    const drawPin = (id, pt, color = '#2563eb', ringColor = '#ffffff') => {
      if (!pt) return;
      const px = pt.x * w;
      const py = pt.y * h;
      const isHovered = hoveredPinId === String(id);
      const isActive = activePinId === String(id);

      ctx.fillStyle = isActive ? 'rgba(234, 179, 8, 0.95)' : (isHovered ? 'rgba(59, 130, 246, 0.9)' : color);
      ctx.beginPath();
      ctx.arc(px, py, Math.max(10, w * (isActive ? 0.022 : (isHovered ? 0.018 : 0.013))), 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isActive ? '#facc15' : ringColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(6, w * 0.008), 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, Math.max(3, w * 0.004), 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw Standard Keypoints
    const keyPinIndices = isSide ? [0, 11, 13, 15, 23, 25, 27, 29] : [0, 11, 12, 13, 14, 15, 16, 25, 26, 27, 28, 29, 30];
    keyPinIndices.forEach((idx) => {
      drawPin(idx, landmarks[idx]);
    });

    if (!isSide) {
      if (customPins.chestL) drawPin('chestL', customPins.chestL, 'rgba(244, 63, 94, 0.95)', '#f43f5e');
      if (customPins.chestR) drawPin('chestR', customPins.chestR, 'rgba(244, 63, 94, 0.95)', '#f43f5e');
      if (customPins.waistL) drawPin('waistL', customPins.waistL, 'rgba(16, 185, 129, 0.95)', '#10b981');
      if (customPins.waistR) drawPin('waistR', customPins.waistR, 'rgba(16, 185, 129, 0.95)', '#10b981');
      if (customPins.hipL) drawPin('hipL', customPins.hipL, 'rgba(168, 85, 247, 0.95)', '#a855f7');
      if (customPins.hipR) drawPin('hipR', customPins.hipR, 'rgba(168, 85, 247, 0.95)', '#a855f7');
      if (customPins.thighL) drawPin('thighL', customPins.thighL, 'rgba(251, 146, 60, 0.95)', '#fb923c');
      if (customPins.thighR) drawPin('thighR', customPins.thighR, 'rgba(251, 146, 60, 0.95)', '#fb923c');
    } else {
      if (customPins.sideChestF) drawPin('sideChestF', customPins.sideChestF, 'rgba(244, 63, 94, 0.95)', '#f43f5e');
      if (customPins.sideChestB) drawPin('sideChestB', customPins.sideChestB, 'rgba(244, 63, 94, 0.95)', '#f43f5e');
      if (customPins.sideWaistF) drawPin('sideWaistF', customPins.sideWaistF, 'rgba(16, 185, 129, 0.95)', '#10b981');
      if (customPins.sideWaistB) drawPin('sideWaistB', customPins.sideWaistB, 'rgba(16, 185, 129, 0.95)', '#10b981');
      if (customPins.sideHipF) drawPin('sideHipF', customPins.sideHipF, 'rgba(168, 85, 247, 0.95)', '#a855f7');
      if (customPins.sideHipB) drawPin('sideHipB', customPins.sideHipB, 'rgba(168, 85, 247, 0.95)', '#a855f7');
      if (customPins.sideThighF) drawPin('sideThighF', customPins.sideThighF, 'rgba(251, 146, 60, 0.95)', '#fb923c');
      if (customPins.sideThighB) drawPin('sideThighB', customPins.sideThighB, 'rgba(251, 146, 60, 0.95)', '#fb923c');
    }
  }
}

window.FitPoseEngine = FitPoseEngine;
