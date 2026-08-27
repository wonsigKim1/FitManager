/**
 * FitManager High-Fidelity 3D Mannequin Sample Data Generator v9
 * Generates photorealistic 3D studio-lit mannequin base meshes (Male & Female, Front & Side)
 * matching model1.jpg / model2.jpg and professional 3D measurement guidelines.
 */

function createSampleImages(gender = 'men') {
  const isFemale = gender === 'women';
  const width = 600;
  const height = 900;

  // -------------------------------------------------------------
  // 1. Front View 3D Mannequin Canvas
  // -------------------------------------------------------------
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = width;
  frontCanvas.height = height;
  const ctxF = frontCanvas.getContext('2d');

  // Studio Ambient Background
  const bgGradF = ctxF.createRadialGradient(300, 450, 50, 300, 450, 500);
  bgGradF.addColorStop(0, '#f8fafc');
  bgGradF.addColorStop(0.7, '#edf2f7');
  bgGradF.addColorStop(1, '#e2e8f0');
  ctxF.fillStyle = bgGradF;
  ctxF.fillRect(0, 0, width, height);

  // Soft Studio Floor Shadow
  ctxF.fillStyle = 'rgba(148, 163, 184, 0.35)';
  ctxF.beginPath();
  ctxF.ellipse(300, 832, isFemale ? 140 : 165, 24, 0, 0, Math.PI * 2);
  ctxF.fill();
  ctxF.fillStyle = 'rgba(100, 116, 139, 0.45)';
  ctxF.beginPath();
  ctxF.ellipse(300, 832, isFemale ? 95 : 115, 14, 0, 0, Math.PI * 2);
  ctxF.fill();

  // 3D Shading Gradients
  const bodyGradF = ctxF.createLinearGradient(180, 0, 420, 0);
  bodyGradF.addColorStop(0, '#64748b');    // Left Shadow / Occlusion
  bodyGradF.addColorStop(0.25, '#94a3b8'); // Midtone
  bodyGradF.addColorStop(0.5, '#cbd5e1');  // Core 3D Specular Center
  bodyGradF.addColorStop(0.75, '#94a3b8'); // Midtone
  bodyGradF.addColorStop(1, '#475569');    // Right Shadow / Occlusion

  const headGradF = ctxF.createRadialGradient(290, 125, 5, 300, 135, 55);
  headGradF.addColorStop(0, '#f1f5f9');
  headGradF.addColorStop(0.6, '#94a3b8');
  headGradF.addColorStop(1, '#475569');

  ctxF.lineCap = 'round';
  ctxF.lineJoin = 'round';

  if (!isFemale) {
    // =========================================================
    // MALE 3D BASE MESH (model1.jpg)
    // =========================================================
    // 1. Head & Cranium
    ctxF.fillStyle = headGradF;
    ctxF.beginPath();
    ctxF.ellipse(300, 135, 42, 54, 0, 0, Math.PI * 2);
    ctxF.fill();

    // 2. Neck & Trapezius
    ctxF.fillStyle = bodyGradF;
    ctxF.beginPath();
    ctxF.moveTo(284, 175);
    ctxF.lineTo(280, 215);
    ctxF.lineTo(320, 215);
    ctxF.lineTo(316, 175);
    ctxF.closePath();
    ctxF.fill();

    // 3. Torso & Muscular Contour (Broad Shoulders, Pectorals, Latissimus)
    ctxF.beginPath();
    ctxF.moveTo(280, 215);
    ctxF.lineTo(195, 238); // Left Deltoid Acromion
    ctxF.lineTo(185, 315); // Left Chest Axillary
    ctxF.lineTo(215, 410); // Left Waist Inward
    ctxF.lineTo(198, 485); // Left Hip Trochanter
    ctxF.lineTo(265, 520); // Left Groin
    ctxF.lineTo(300, 520); // Center Groin
    ctxF.lineTo(335, 520); // Right Groin
    ctxF.lineTo(402, 485); // Right Hip Trochanter
    ctxF.lineTo(385, 410); // Right Waist Inward
    ctxF.lineTo(415, 315); // Right Chest Axillary
    ctxF.lineTo(405, 238); // Right Deltoid Acromion
    ctxF.lineTo(320, 215);
    ctxF.closePath();
    ctxF.fill();

    // Pectoral Muscle 3D Highlights
    ctxF.fillStyle = 'rgba(241, 245, 249, 0.4)';
    ctxF.beginPath();
    ctxF.ellipse(250, 280, 32, 22, -0.1, 0, Math.PI * 2);
    ctxF.fill();
    ctxF.beginPath();
    ctxF.ellipse(350, 280, 32, 22, 0.1, 0, Math.PI * 2);
    ctxF.fill();

    // 4. Arms (Natural A-Pose with 3D limb gradients)
    ctxF.strokeStyle = bodyGradF;
    // Left Arm
    ctxF.lineWidth = 32;
    ctxF.beginPath();
    ctxF.moveTo(195, 238);
    ctxF.lineTo(155, 340); // Elbow
    ctxF.stroke();
    ctxF.lineWidth = 26;
    ctxF.beginPath();
    ctxF.moveTo(155, 340);
    ctxF.lineTo(135, 440); // Wrist
    ctxF.stroke();
    ctxF.lineWidth = 20;
    ctxF.beginPath();
    ctxF.moveTo(135, 440);
    ctxF.lineTo(128, 475); // Hand
    ctxF.stroke();

    // Right Arm
    ctxF.lineWidth = 32;
    ctxF.beginPath();
    ctxF.moveTo(405, 238);
    ctxF.lineTo(445, 340); // Elbow
    ctxF.stroke();
    ctxF.lineWidth = 26;
    ctxF.beginPath();
    ctxF.moveTo(445, 340);
    ctxF.lineTo(465, 440); // Wrist
    ctxF.stroke();
    ctxF.lineWidth = 20;
    ctxF.beginPath();
    ctxF.moveTo(465, 440);
    ctxF.lineTo(472, 475); // Hand
    ctxF.stroke();

    // 5. Legs (Muscular Thighs & Calves)
    // Left Leg
    ctxF.lineWidth = 46;
    ctxF.beginPath();
    ctxF.moveTo(245, 510);
    ctxF.lineTo(240, 650); // Knee
    ctxF.stroke();
    ctxF.lineWidth = 36;
    ctxF.beginPath();
    ctxF.moveTo(240, 650);
    ctxF.lineTo(235, 800); // Ankle
    ctxF.stroke();
    ctxF.lineWidth = 24;
    ctxF.beginPath();
    ctxF.moveTo(235, 800);
    ctxF.lineTo(220, 822); // Foot
    ctxF.stroke();

    // Right Leg
    ctxF.lineWidth = 46;
    ctxF.beginPath();
    ctxF.moveTo(355, 510);
    ctxF.lineTo(360, 650); // Knee
    ctxF.stroke();
    ctxF.lineWidth = 36;
    ctxF.beginPath();
    ctxF.moveTo(360, 650);
    ctxF.lineTo(365, 800); // Ankle
    ctxF.stroke();
    ctxF.lineWidth = 24;
    ctxF.beginPath();
    ctxF.moveTo(365, 800);
    ctxF.lineTo(380, 822); // Foot
    ctxF.stroke();

  } else {
    // =========================================================
    // FEMALE 3D BASE MESH (3D Feminine Mannequin)
    // =========================================================
    // 1. Head (Feminine)
    ctxF.fillStyle = headGradF;
    ctxF.beginPath();
    ctxF.ellipse(300, 130, 38, 50, 0, 0, Math.PI * 2);
    ctxF.fill();

    // 2. Neck
    ctxF.fillStyle = bodyGradF;
    ctxF.beginPath();
    ctxF.moveTo(288, 170);
    ctxF.lineTo(286, 210);
    ctxF.lineTo(314, 210);
    ctxF.lineTo(312, 170);
    ctxF.closePath();
    ctxF.fill();

    // 3. Torso (Narrow shoulders, defined 3D bust, hourglass waist, wide hips)
    ctxF.beginPath();
    ctxF.moveTo(286, 210);
    ctxF.lineTo(215, 235); // Left Shoulder
    ctxF.quadraticCurveTo(195, 305, 205, 320); // Left Bust Curve
    ctxF.quadraticCurveTo(230, 385, 235, 410); // Hourglass Waist Indent
    ctxF.quadraticCurveTo(190, 460, 195, 490); // Left Iliac Hip Curvature
    ctxF.lineTo(265, 520); // Left Groin
    ctxF.lineTo(300, 520); // Center Groin
    ctxF.lineTo(335, 520); // Right Groin
    ctxF.lineTo(405, 490); // Right Iliac Hip Curvature
    ctxF.quadraticCurveTo(410, 460, 365, 410); // Right Waist Indent
    ctxF.quadraticCurveTo(370, 385, 395, 320); // Right Bust Curve
    ctxF.lineTo(385, 235); // Right Shoulder
    ctxF.lineTo(314, 210);
    ctxF.closePath();
    ctxF.fill();

    // Bust 3D Highlights
    ctxF.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctxF.beginPath();
    ctxF.ellipse(258, 295, 26, 22, -0.15, 0, Math.PI * 2);
    ctxF.fill();
    ctxF.beginPath();
    ctxF.ellipse(342, 295, 26, 22, 0.15, 0, Math.PI * 2);
    ctxF.fill();

    // 4. Arms (Slender Feminine)
    ctxF.strokeStyle = bodyGradF;
    // Left Arm
    ctxF.lineWidth = 24;
    ctxF.beginPath();
    ctxF.moveTo(215, 235);
    ctxF.lineTo(180, 335); // Elbow
    ctxF.stroke();
    ctxF.lineWidth = 18;
    ctxF.beginPath();
    ctxF.moveTo(180, 335);
    ctxF.lineTo(160, 435); // Wrist
    ctxF.stroke();
    ctxF.lineWidth = 14;
    ctxF.beginPath();
    ctxF.moveTo(160, 435);
    ctxF.lineTo(155, 468); // Hand
    ctxF.stroke();

    // Right Arm
    ctxF.lineWidth = 24;
    ctxF.beginPath();
    ctxF.moveTo(385, 235);
    ctxF.lineTo(420, 335); // Elbow
    ctxF.stroke();
    ctxF.lineWidth = 18;
    ctxF.beginPath();
    ctxF.moveTo(420, 335);
    ctxF.lineTo(440, 435); // Wrist
    ctxF.stroke();
    ctxF.lineWidth = 14;
    ctxF.beginPath();
    ctxF.moveTo(440, 435);
    ctxF.lineTo(445, 468); // Hand
    ctxF.stroke();

    // 5. Legs (Q-Angle & Feminine Thigh Curve)
    ctxF.lineWidth = 38;
    ctxF.beginPath();
    ctxF.moveTo(245, 510);
    ctxF.lineTo(242, 650); // Knee
    ctxF.stroke();
    ctxF.lineWidth = 28;
    ctxF.beginPath();
    ctxF.moveTo(242, 650);
    ctxF.lineTo(238, 800); // Ankle
    ctxF.stroke();
    ctxF.lineWidth = 20;
    ctxF.beginPath();
    ctxF.moveTo(238, 800);
    ctxF.lineTo(225, 822); // Foot
    ctxF.stroke();

    ctxF.lineWidth = 38;
    ctxF.beginPath();
    ctxF.moveTo(355, 510);
    ctxF.lineTo(358, 650); // Knee
    ctxF.stroke();
    ctxF.lineWidth = 28;
    ctxF.beginPath();
    ctxF.moveTo(358, 650);
    ctxF.lineTo(362, 800); // Ankle
    ctxF.stroke();
    ctxF.lineWidth = 20;
    ctxF.beginPath();
    ctxF.moveTo(362, 800);
    ctxF.lineTo(375, 822); // Foot
    ctxF.stroke();
  }


  // -------------------------------------------------------------
  // 2. Side View 3D Mannequin Canvas
  // -------------------------------------------------------------
  const sideCanvas = document.createElement('canvas');
  sideCanvas.width = width;
  sideCanvas.height = height;
  const ctxS = sideCanvas.getContext('2d');

  ctxS.fillStyle = bgGradF;
  ctxS.fillRect(0, 0, width, height);

  ctxS.fillStyle = 'rgba(148, 163, 184, 0.35)';
  ctxS.beginPath();
  ctxS.ellipse(300, 832, isFemale ? 130 : 145, 24, 0, 0, Math.PI * 2);
  ctxS.fill();
  ctxS.fillStyle = 'rgba(100, 116, 139, 0.45)';
  ctxS.beginPath();
  ctxS.ellipse(300, 832, isFemale ? 90 : 105, 14, 0, 0, Math.PI * 2);
  ctxS.fill();

  const bodyGradS = ctxS.createLinearGradient(230, 0, 380, 0);
  bodyGradS.addColorStop(0, '#475569');    // Front Occlusion
  bodyGradS.addColorStop(0.35, '#cbd5e1'); // Highlight
  bodyGradS.addColorStop(0.75, '#94a3b8'); // Midtone
  bodyGradS.addColorStop(1, '#64748b');    // Back Occlusion

  ctxS.lineCap = 'round';
  ctxS.lineJoin = 'round';

  if (!isFemale) {
    // =========================================================
    // MALE 3D SIDE PROFILE (model2.jpg)
    // =========================================================
    // 1. Head Profile (Nose, Brow, Chin)
    ctxS.fillStyle = headGradF;
    ctxS.beginPath();
    ctxS.ellipse(300, 135, 46, 52, 0, 0, Math.PI * 2);
    ctxS.fill();
    ctxS.beginPath();
    ctxS.moveTo(260, 125);
    ctxS.lineTo(242, 138); // Nose
    ctxS.lineTo(258, 148); // Lips
    ctxS.lineTo(248, 160); // Chin
    ctxS.lineTo(265, 172);
    ctxS.closePath();
    ctxS.fill();

    // 2. Neck
    ctxS.fillStyle = bodyGradS;
    ctxS.fillRect(285, 175, 33, 40);

    // 3. S-Curve Torso (Pectoral Depth, Lordosis, Gluteal Contour)
    ctxS.beginPath();
    ctxS.moveTo(288, 215); // Front Neck
    ctxS.quadraticCurveTo(238, 285, 245, 325); // Pectoral Protrusion
    ctxS.quadraticCurveTo(255, 380, 260, 395); // Abdominal Wall
    ctxS.quadraticCurveTo(250, 480, 252, 480); // Groin
    ctxS.lineTo(265, 520);
    ctxS.lineTo(330, 520);
    ctxS.quadraticCurveTo(368, 460, 360, 420); // Gluteal Prominence
    ctxS.quadraticCurveTo(345, 340, 335, 270); // Upper Thoracic Spine
    ctxS.lineTo(315, 215); // Back Neck
    ctxS.closePath();
    ctxS.fill();

    // 4. Arm (Side Relaxed)
    ctxS.strokeStyle = bodyGradS;
    ctxS.lineWidth = 28;
    ctxS.beginPath();
    ctxS.moveTo(300, 240);
    ctxS.lineTo(305, 345); // Elbow
    ctxS.stroke();
    ctxS.lineWidth = 24;
    ctxS.beginPath();
    ctxS.moveTo(305, 345);
    ctxS.lineTo(310, 440); // Wrist
    ctxS.stroke();

    // 5. Leg (Side Lateral)
    ctxS.lineWidth = 48;
    ctxS.beginPath();
    ctxS.moveTo(295, 510);
    ctxS.lineTo(300, 650); // Knee
    ctxS.stroke();
    ctxS.lineWidth = 36;
    ctxS.beginPath();
    ctxS.moveTo(300, 650);
    ctxS.lineTo(305, 800); // Ankle
    ctxS.stroke();
    ctxS.lineWidth = 24;
    ctxS.beginPath();
    ctxS.moveTo(305, 800);
    ctxS.lineTo(250, 822); // Foot Forward
    ctxS.stroke();

  } else {
    // =========================================================
    // FEMALE 3D SIDE PROFILE
    // =========================================================
    ctxS.fillStyle = headGradF;
    ctxS.beginPath();
    ctxS.ellipse(300, 130, 42, 48, 0, 0, Math.PI * 2);
    ctxS.fill();
    ctxS.beginPath();
    ctxS.moveTo(262, 122);
    ctxS.lineTo(246, 134); // Nose
    ctxS.lineTo(260, 144);
    ctxS.lineTo(252, 154); // Chin
    ctxS.lineTo(268, 166);
    ctxS.closePath();
    ctxS.fill();

    ctxS.fillStyle = bodyGradS;
    ctxS.fillRect(288, 170, 26, 40);

    // S-Curve with Bust Projection & Deep Lumbar Arch
    ctxS.beginPath();
    ctxS.moveTo(290, 210);
    ctxS.quadraticCurveTo(225, 280, 235, 320); // Bust Forward Projection
    ctxS.quadraticCurveTo(255, 380, 258, 390); // Waist Arch
    ctxS.quadraticCurveTo(245, 475, 248, 475);
    ctxS.lineTo(265, 520);
    ctxS.lineTo(330, 520);
    ctxS.quadraticCurveTo(375, 460, 370, 420); // Distinct Gluteal Contour
    ctxS.quadraticCurveTo(350, 340, 335, 265); // Upper Back
    ctxS.lineTo(312, 210);
    ctxS.closePath();
    ctxS.fill();

    // Bust Highlight
    ctxS.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctxS.beginPath();
    ctxS.ellipse(250, 300, 22, 20, -0.2, 0, Math.PI * 2);
    ctxS.fill();

    // Arm (Slender)
    ctxS.strokeStyle = bodyGradS;
    ctxS.lineWidth = 22;
    ctxS.beginPath();
    ctxS.moveTo(300, 235);
    ctxS.lineTo(305, 340);
    ctxS.stroke();
    ctxS.lineWidth = 18;
    ctxS.beginPath();
    ctxS.moveTo(305, 340);
    ctxS.lineTo(310, 435);
    ctxS.stroke();

    // Leg
    ctxS.lineWidth = 40;
    ctxS.beginPath();
    ctxS.moveTo(295, 510);
    ctxS.lineTo(298, 650);
    ctxS.stroke();
    ctxS.lineWidth = 28;
    ctxS.beginPath();
    ctxS.moveTo(298, 650);
    ctxS.lineTo(305, 800);
    ctxS.stroke();
    ctxS.lineWidth = 20;
    ctxS.beginPath();
    ctxS.moveTo(305, 800);
    ctxS.lineTo(255, 822);
    ctxS.stroke();
  }

  return {
    front: frontCanvas.toDataURL('image/png'),
    side: sideCanvas.toDataURL('image/png')
  };
}

window.FitSampleData = {
  getSampleImages: createSampleImages
};
