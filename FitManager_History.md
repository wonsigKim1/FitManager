# FitManager Project History & Technical Specification (AI-Optimized Context)

## 1. Project Overview & Meta Information
- **Project Name**: FitManager
- **Core Domain**: Computer Vision Body Anthropometry & Apparel Sizing Recommendation
- **Current Architecture**: Client-Side Single Page Application (HTML5 / Vanilla JS / Canvas / Tailwind CSS / MediaPipe Pose) with Python Local HTTP Server
- **Platform Roadmap**:
  - Phase 1 (MVP): Responsive Web Application (Current)
  - Phase 2: Hybrid / Cross-platform Mobile App (React Native / Flutter / PWA)
- **Target Reference Standard**: [Uniqlo Size & Body Measurement Guidelines](https://faq-kr.uniqlo.com/pkb_Home_UQ_KR?id=kA0Ie000000TO06&q=utme&l=ko&fs=RelatedArticle)

---

## 2. System Workflow & User Journey
1. **Landing & Input State (Step 1)**:
   - Primary prompt: "정면과 측면 사진을 넣어주세요." (Upload front and side full-body photos)
   - Dual drag-and-drop file inputs (Front view & Side view).
   - "샘플 사진으로 테스트" button to load synthetic canvas silhouette test models instantly.
2. **Height & Metadata Input (Step 2)**:
   - Activates automatically upon receiving both images.
   - Prompt: "키를 기입해주세요." (Enter height in cm).
   - Gender selection (Men / Women) for anthropometric ratio calibration.
3. **Execution & Analysis (Step 3)**:
   - "측정하기" (Measure) action trigger.
   - MediaPipe Pose 33-landmark extraction on front & side canvases.
   - Multi-axis distortion correction (Roll, Yaw, Pitch).
   - 8-point Uniqlo anthropometric calculation.
   - 3D circumference synthesis using Ramanujan Ellipse approximation.
   - UI Result rendering & Skeleton overlay canvas projection.

---

## 3. Mathematical & Anthropometric Algorithms

### A. 2D Roll Distortion Correction (Tilt Alignment)
- Shoulder vector: $\vec{v}_{sh} = (R_{sh}.x - L_{sh}.x, R_{sh}.y - L_{sh}.y)$
- Shoulder angle: $\theta_{sh} = \arctan\left(\frac{\Delta y}{\Delta x}\right)$
- Spine vertical vector: $\vec{v}_{spine} = (M_{hip}.x - M_{sh}.x, M_{hip}.y - M_{sh}.y)$
- Composite Roll Angle: $\theta_{roll} = \frac{\theta_{sh} + \theta_{spine}}{2}$
- Correction: Inverse rotation matrix $R(-\theta_{roll})$ applied to all 2D landmark coordinates.

### B. Yaw Distortion Correction (Transverse Body Rotation)
- Asymmetry metric: $\alpha = \frac{|x_{nose} - x_{L\_sh}| - |x_{nose} - x_{R\_sh}|}{|x_{nose} - x_{L\_sh}| + |x_{nose} - x_{R\_sh}|}$
- Yaw Angle: $\phi_{yaw} = \arcsin(\text{clamp}(\alpha \times 1.2, -0.5, 0.5))$
- Transverse Scaling Factor: $k_{yaw} = \frac{1}{\cos(\phi_{yaw})}$

### C. Pitch Distortion Correction (Perspective & Camera Elevation)
- Observed Torso-to-Leg Ratio: $R_{obs} = \frac{\text{dist}(M_{sh}, M_{hip})}{\text{dist}(M_{hip}, M_{ank})}$
- Standard Ergonomic Ratio: $R_{std} = 0.58$ (Men) / $0.55$ (Women)
- Pitch Scaling Factor: $k_{pitch} = \text{clamp}(1 + (R_{obs} - R_{std}) \times 0.4, 0.92, 1.08)$

### D. Pixel-to-Centimeter Scaling
- Head Vertex: $y_{vertex} = y_{nose} - 1.25 \times |y_{sh} - y_{nose}|$
- Heel/Floor Level: $y_{floor} = \max(y_{heel\_L}, y_{heel\_R}, y_{foot\_L}, y_{foot\_R}, y_{ank} + 0.05 \times H)$
- Total Body Height in Pixels: $H_{px} = y_{floor} - y_{vertex}$
- Scale Factor: $S = \frac{\text{Height}_{cm}}{H_{px}}$

### E. 3D Circumference Approximation (Ramanujan Ellipse Formula)
Given semi-major axis $a = \frac{\text{Width}_{front}}{2}$ and semi-minor axis $b = \frac{\text{Depth}_{side}}{2}$:
$$C \approx \pi \left[ 3(a + b) - \sqrt{(3a + b)(a + 3b)} \right]$$

---

## 4. 8 Core Measurement Specifications (Uniqlo Standard Mappings)
1. **상체 길이 (Torso Length)**:
   - Anatomical anchor: C7 Vertebra Prominens (Mid-Shoulder) to Superior Iliac Crest / Mid-Hip.
   - Formula: $L_{torso} = \text{dist}(M_{sh}, M_{hip}) \times S \times k_{pitch} \times 1.05$
2. **어깨 넓이 (Shoulder Width)**:
   - Anatomical anchor: Left Biacromial point to Right Biacromial point.
   - Formula: $W_{sh} = |L_{sh}.x - R_{sh}.x| \times S \times k_{yaw} \times 1.04$
3. **가슴 넓이 & 가슴 둘레 (Chest Width & Circumference)**:
   - Anatomical anchor: Sub-axillary maximum horizontal transverse breadth & sagittal chest depth.
   - Formula: $W_{chest} = 0.94 \times W_{sh}$, $C_{chest} = \text{Ramanujan}(W_{chest}, D_{chest})$
4. **팔 길이 (Arm Length)**:
   - Anatomical anchor: Acromion $\to$ Lateral Epicondyle (Elbow) $\to$ Radial Styloid (Wrist).
   - Formula: $L_{arm} = (\text{dist}(S, E) + \text{dist}(E, W)) \times S \times 1.02$
5. **허리 넓이 & 허리 둘레 (Waist Width & Circumference)**:
   - Anatomical anchor: Minimum horizontal circumference between lowest rib and iliac crest.
   - Formula: $W_{waist} = W_{sh} \times 0.77$, $C_{waist} = \text{Ramanujan}(W_{waist}, D_{waist})$
6. **골반 넓이 & 엉덩이 둘레 (Pelvis/Hip Width & Circumference)**:
   - Anatomical anchor: Greater Trochanter prominence & maximum gluteal protrusion.
   - Formula: $W_{hip} = \text{dist}(L_{hip}, R_{hip}) \times 1.28 \times S \times k_{yaw}$, $C_{hip} = \text{Ramanujan}(W_{hip}, D_{hip})$
7. **허벅지 넓이 & 허벅지 둘레 (Thigh Width & Circumference)**:
   - Anatomical anchor: Immediately below perineum / gluteal fold.
   - Formula: $W_{thigh} = 0.54 \times W_{hip}$, $C_{thigh} = \text{Ramanujan}(W_{thigh}, D_{thigh})$
8. **다리 길이 (Leg Length - Outseam & Inseam)**:
   - Anatomical anchor: Greater Trochanter to Lateral Malleolus (Outseam) & Perineum to Medial Malleolus (Inseam).
   - Formula: $\text{Outseam} = (\text{dist}(Hip, Knee) + \text{dist}(Knee, Ank)) \times S \times (2 - k_{pitch})$, $\text{Inseam} \approx \text{Outseam} \times 0.78$

---

## 5. File Structure in Google Drive Folder `FitManager`
- `index.html`: Complete UI markup, drag-drop dropzones, height input, results dashboard, Phosphor icons, Tailwind CSS integration.
- `style.css`: Custom animations, Pretendard typography, scrollbar styling, glassmorphism card effects.
- `app.js`: Application state controller, event handlers, canvas rendering, DOM manipulation, clipboard integration.
- `pose-engine.js`: MediaPipe Pose API handler, CV fallback landmark predictor, distortion correction engine, Ramanujan ellipse calculator, Uniqlo size matcher.
- `sample-data.js`: High-resolution procedural SVG/Canvas front & side human body test model generator.
- `server.py`: Python-based CORS-enabled local HTTP server.
- `run_windows.bat`: 1-click Windows execution launcher.
- `run_mac.sh`: 1-click Mac/Linux execution launcher.
- `README.md`: Step-by-step user execution guide.
- `FitManager` (Google Doc): User-facing project specification and development documentation.
- `FitManager_History.md` (This file): AI-optimized structured project history and mathematical architecture document.

---

## 6. Chronological Conversation & Milestone Log
- **2026-08-18 15:41 KST (Initial Conception)**:
  - User requested body measurement service 'FitManager'.
  - Decided on Photo + Height ratio calculation approach with Keypoint API.
  - Set roadmap: Web App MVP $\to$ iOS/Android mobile apps.
- **2026-08-18 15:54 KST (Full Web App Architecture & Uniqlo Sizing)**:
  - User detailed UI flow (Front/Side photo upload $\to$ Height input $\to$ Measure button).
  - Defined 8 core measurement items according to Uniqlo FAQ size guide.
  - Implemented multi-axis distortion correction (Roll, Yaw, Pitch).
  - Built complete web application code and launched local web server on port 8080.
- **2026-08-18 15:58 KST (Beginner Execution Guide)**:
  - User requested step-by-step beginner guide for running and accessing the web app.
  - Documented 3 execution methods (Direct browser, 1-click batch/shell launcher, Python server) in Google Docs.
- **2026-08-18 16:05 KST (Drive Folder Organization & Dual History Provision)**:
  - Created 'FitManager' folder in Google Drive.
  - Moved Google Doc into folder and uploaded all source code and assets.
  - Created dual history formats: Google Docs (User-friendly) and Markdown (AI-optimized context).

---

# 19. 쇼핑몰 사이즈표 OCR 파서 고도화 및 3D 마네킹/여성 체형 엔진 v8 구축

### 1. 쇼핑몰 복합 사이즈표 OCR 등록 실패 원인 심층 분석 및 해결책
- **문제 원인**:
  1. `S/38`, `M/40`, `L/42`와 같은 알파벳/호칭 복합 슬래시(`/`) 표기 시, 정규식이 슬래시 뒤 숫자를 첫 번째 치수 데이터로 추출하여 열 인덱스가 밀리는 현상(Column Shifting) 발생.
  2. `어깨 너비`, `가슴 단면`, `소매 길이` 등 헤더 띄어쓰기로 인한 토큰 분리 및 사전 매핑 실패.
  3. 표 하단의 `측정 방법에 따라 1~3cm 오차...` 등의 안내 문구가 데이터 행으로 오인식되어 유효성 검사 탈락.
- **v8 해결책**:
  1. `server.py`의 `ocr_process_sizechart()` 정규표현식을 개편하여 슬래시/괄호 복합 표기를 라벨로 자동 정규화하고 치수 데이터 목록에서 해당 숫자를 제거.
  2. 유의사항/주석 필터링 키워드(`오차`, `측정`, `모니터` 등)를 적용하여 노이즈 행을 원천 배제.
  3. `가슴단면(58cm)`을 단면 수치로 정확히 인식하고 신체 둘레 대조 시 $58 \times 2 = 116\text{cm}$로 자동 환산하여 착용 여부를 정확히 판별.

### 2. 3D 마네킹 가이드 및 여성(Women) 인체 계측 엔진 탑재
- **3D 마네킹 랜드마크 기준 (`FinalBaseMesh.obj` 기반)**:
  - **정면**: 견봉점(어깨 너비), 대흉근/겨드랑이선(가슴 단면), 장골능 상단(허리 너비), 대전자(골반 너비), 경추점(상의 총장), 어깨-팔꿈치-손목(팔 길이), 골반-무릎-복사뼈(다리 총장).
  - **측면**: 가슴 앞/뒤 두께, 허리 앞/뒤 두께, 둔부 돌출 두께를 추출하여 라마누잔 타원 둘레 공식 적용.
- **여성(Women) 체형 모델링 및 샘플 생성 엔진 (`sample-data.js`)**:
  - 남성 대비 좁은 어깨(15~20% 축소), 전방 흉곽 버스트 볼륨(Bust Prominence), 뚜렷한 허리 곡률 및 확장된 골반(WHR 0.70~0.75), 대퇴골 Q-angle을 반영한 정면/측면 벡터 실루엣 생성 엔진 구현.
  - 성별 선택 라디오 버튼(MEN/WOMEN)과 연동되어 1-Click 샘플 테스트 시 선택된 성별의 정면/측면 실루엣이 즉시 로드되도록 개편.

### 3. 패키지 및 드라이브 ZIP 파일 버전 관리
- **최신 배포 파일**: `FitManager_App_v8.zip`
- **ZIP 관리 정책**: Google Drive `FitManager` 폴더 내 항상 최신 3개 버전(v8, v7, v6)만 유지.
