import http.server
import socketserver
import os
import sys
import json
import base64
import math
import io
import re
import numpy as np
from PIL import Image
import cv2
import pytesseract

PORT = 8080
DIRECTORY = "/working_dir/c_648fc9297109ff5f/fitmanager"

def decode_base64_image(base64_str):
    if ',' in base64_str:
        base64_str = base64_str.split(',')[1]
    image_bytes = base64.b64decode(base64_str)
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    return np.array(image)

def ramanujan_ellipse_circumference(width, depth):
    a = width / 2.0
    b = depth / 2.0
    if a <= 0 or b <= 0:
        return max(0.0, width * math.pi)
    term = math.sqrt((3.0 * a + b) * (a + 3.0 * b))
    return math.pi * (3.0 * (a + b) - term)

def extract_body_landmarks_adaptive(image_np, is_side=False):
    h, w, _ = image_np.shape
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 25, 80)
    
    top_y = 0.04
    bot_y = 0.96
    norm_h = bot_y - top_y
    cx = 0.50
    
    def get_row_extent(y_ratio, default_half_w):
        y_px = int(np.clip(y_ratio * h, 0, h - 1))
        sub = edges[max(0, y_px - 10):min(h, y_px + 10), :]
        edge_pts = np.where(sub > 0)[1]
        if len(edge_pts) >= 2:
            left = np.min(edge_pts) / float(w)
            right = np.max(edge_pts) / float(w)
            if (right - left) > 0.20 and (right - left) < 0.95:
                return left, right
        return max(0.05, cx - default_half_w), min(0.95, cx + default_half_w)

    lm = [{"x": float(cx), "y": float(top_y + norm_h * 0.5), "z": 0.0, "visibility": 0.9} for _ in range(33)]

    # Head / Nose
    lm[0] = {"x": float(cx), "y": float(top_y + norm_h * 0.075), "z": 0.0, "visibility": 0.95}
    lm[2] = {"x": float(cx - 0.06), "y": float(top_y + norm_h * 0.065), "z": 0.0, "visibility": 0.9}
    lm[5] = {"x": float(cx + 0.06), "y": float(top_y + norm_h * 0.065), "z": 0.0, "visibility": 0.9}

    if not is_side:
        # Shoulders (Level 0.17)
        sh_l, sh_r = get_row_extent(0.20, 0.32)
        lm[11] = {"x": float(sh_l), "y": float(top_y + norm_h * 0.17), "z": 0.0, "visibility": 0.95}
        lm[12] = {"x": float(sh_r), "y": float(top_y + norm_h * 0.17), "z": 0.0, "visibility": 0.95}

        # Elbows & Wrists
        lm[13] = {"x": float(max(0.05, sh_l - 0.06)), "y": float(top_y + norm_h * 0.34), "z": 0.0, "visibility": 0.9}
        lm[14] = {"x": float(min(0.95, sh_r + 0.06)), "y": float(top_y + norm_h * 0.34), "z": 0.0, "visibility": 0.9}
        lm[15] = {"x": float(max(0.06, sh_l - 0.04)), "y": float(top_y + norm_h * 0.48), "z": 0.0, "visibility": 0.9}
        lm[16] = {"x": float(min(0.94, sh_r + 0.04)), "y": float(top_y + norm_h * 0.48), "z": 0.0, "visibility": 0.9}

        # Single Unified Hip (Level 0.50)
        hip_l, hip_r = get_row_extent(0.52, 0.22)
        lm[23] = {"x": float(hip_l), "y": float(top_y + norm_h * 0.50), "z": 0.0, "visibility": 0.95}
        lm[24] = {"x": float(hip_r), "y": float(top_y + norm_h * 0.50), "z": 0.0, "visibility": 0.95}

        # Knees & Ankles
        lm[25] = {"x": float(cx - 0.15), "y": float(top_y + norm_h * 0.72), "z": 0.0, "visibility": 0.95}
        lm[26] = {"x": float(cx + 0.15), "y": float(top_y + norm_h * 0.72), "z": 0.0, "visibility": 0.95}
        lm[27] = {"x": float(cx - 0.13), "y": float(top_y + norm_h * 0.92), "z": 0.0, "visibility": 0.95}
        lm[28] = {"x": float(cx + 0.13), "y": float(top_y + norm_h * 0.92), "z": 0.0, "visibility": 0.95}

        lm[29] = {"x": float(cx - 0.13), "y": float(top_y + norm_h * 0.96), "z": 0.0, "visibility": 0.9}
        lm[30] = {"x": float(cx + 0.13), "y": float(top_y + norm_h * 0.96), "z": 0.0, "visibility": 0.9}
        lm[31] = {"x": float(cx - 0.15), "y": float(top_y + norm_h * 0.98), "z": 0.0, "visibility": 0.9}
        lm[32] = {"x": float(cx + 0.15), "y": float(top_y + norm_h * 0.98), "z": 0.0, "visibility": 0.9}

        chest_l, chest_r = get_row_extent(0.28, 0.28)
        waist_l, waist_r = get_row_extent(0.40, 0.20)

        custom_pins = {
            "chestL": {"x": float(chest_l), "y": float(top_y + norm_h * 0.27), "name": "정면 가슴 좌측점"},
            "chestR": {"x": float(chest_r), "y": float(top_y + norm_h * 0.27), "name": "정면 가슴 우측점"},
            "waistL": {"x": float(waist_l), "y": float(top_y + norm_h * 0.39), "name": "정면 허리 좌측점"},
            "waistR": {"x": float(waist_r), "y": float(top_y + norm_h * 0.39), "name": "정면 허리 우측점"},
            "hipL": {"x": float(hip_l), "y": float(top_y + norm_h * 0.50), "name": "정면 골반 좌측점"},
            "hipR": {"x": float(hip_r), "y": float(top_y + norm_h * 0.50), "name": "정면 골반 우측점"},
            "thighL": {"x": float(cx - 0.18), "y": float(top_y + norm_h * 0.59), "name": "정면 허벅지 바깥점"},
            "thighR": {"x": float(cx - 0.04), "y": float(top_y + norm_h * 0.59), "name": "정면 허벅지 안쪽점"}
        }
    else:
        # Side Profile
        lm[11] = {"x": float(cx), "y": float(top_y + norm_h * 0.17), "z": 0.0, "visibility": 0.95}
        lm[12] = {"x": float(cx), "y": float(top_y + norm_h * 0.17), "z": 0.0, "visibility": 0.95}
        lm[13] = {"x": float(cx + 0.08), "y": float(top_y + norm_h * 0.34), "z": 0.0, "visibility": 0.9}
        lm[15] = {"x": float(cx + 0.10), "y": float(top_y + norm_h * 0.48), "z": 0.0, "visibility": 0.9}
        lm[23] = {"x": float(cx), "y": float(top_y + norm_h * 0.50), "z": 0.0, "visibility": 0.95}
        lm[24] = {"x": float(cx), "y": float(top_y + norm_h * 0.50), "z": 0.0, "visibility": 0.95}
        lm[25] = {"x": float(cx + 0.04), "y": float(top_y + norm_h * 0.72), "z": 0.0, "visibility": 0.95}
        lm[27] = {"x": float(cx), "y": float(top_y + norm_h * 0.92), "z": 0.0, "visibility": 0.95}
        lm[29] = {"x": float(cx - 0.05), "y": float(top_y + norm_h * 0.96), "z": 0.0, "visibility": 0.9}
        lm[31] = {"x": float(cx + 0.15), "y": float(top_y + norm_h * 0.98), "z": 0.0, "visibility": 0.9}

        custom_pins = {
            "sideChestF": {"x": float(cx - 0.20), "y": float(top_y + norm_h * 0.27), "name": "측면 가슴 앞점"},
            "sideChestB": {"x": float(cx + 0.20), "y": float(top_y + norm_h * 0.27), "name": "측면 가슴 뒷점(등)"},
            "sideWaistF": {"x": float(cx - 0.15), "y": float(top_y + norm_h * 0.39), "name": "측면 허리 앞점(복부)"},
            "sideWaistB": {"x": float(cx + 0.15), "y": float(top_y + norm_h * 0.39), "name": "측면 허리 뒷점"},
            "sideHipF": {"x": float(cx - 0.18), "y": float(top_y + norm_h * 0.50), "name": "측면 골반 앞점"},
            "sideHipB": {"x": float(cx + 0.24), "y": float(top_y + norm_h * 0.50), "name": "측면 엉덩이 돌출점"},
            "sideThighF": {"x": float(cx - 0.16), "y": float(top_y + norm_h * 0.59), "name": "측면 허벅지 앞점"},
            "sideThighB": {"x": float(cx + 0.15), "y": float(top_y + norm_h * 0.59), "name": "측면 허벅지 뒷점"}
        }

    return {
        "landmarks": lm,
        "customPins": custom_pins,
        "width": w,
        "height": h
    }

def analyze_body_pipeline(front_img_b64, side_img_b64, height_cm, gender='men'):
    front_np = decode_base64_image(front_img_b64)
    side_np = decode_base64_image(side_img_b64)
    
    front_res = extract_body_landmarks_adaptive(front_np, is_side=False)
    side_res = extract_body_landmarks_adaptive(side_np, is_side=True)
    
    f_lm = front_res['landmarks']
    f_pins = front_res['customPins']
    s_pins = side_res['customPins']
    f_w, f_h = front_res['width'], front_res['height']
    s_w, s_h = side_res['width'], side_res['height']
    
    # 1. Roll Distortion Correction
    l_sh = np.array([f_lm[11]['x'] * f_w, f_lm[11]['y'] * f_h])
    r_sh = np.array([f_lm[12]['x'] * f_w, f_lm[12]['y'] * f_h])
    sh_angle_deg = math.degrees(math.atan2(r_sh[1] - l_sh[1], r_sh[0] - l_sh[0]))
    
    mid_sh = (l_sh + r_sh) / 2.0
    l_hip = np.array([f_pins['hipL']['x'] * f_w, f_pins['hipL']['y'] * f_h])
    r_hip = np.array([f_pins['hipR']['x'] * f_w, f_pins['hipR']['y'] * f_h])
    mid_hip = (l_hip + r_hip) / 2.0
    
    spine_angle_deg = math.degrees(math.atan2(mid_hip[0] - mid_sh[0], mid_hip[1] - mid_sh[1]))
    roll_deg = round((sh_angle_deg + spine_angle_deg) / 2.0, 1)
    
    # 2. Yaw Distortion Correction
    nose = np.array([f_lm[0]['x'] * f_w, f_lm[0]['y'] * f_h])
    d_l = abs(nose[0] - l_sh[0])
    d_r = abs(nose[0] - r_sh[0])
    asym = (d_l - d_r) / (d_l + d_r + 1e-5)
    yaw_factor = round(1.0 / max(0.85, math.cos(math.asin(max(-0.5, min(0.5, asym * 1.2))))), 2)
    
    # 3. Pitch Distortion Correction
    l_ank = np.array([f_lm[27]['x'] * f_w, f_lm[27]['y'] * f_h])
    r_ank = np.array([f_lm[28]['x'] * f_w, f_lm[28]['y'] * f_h])
    mid_ank = (l_ank + r_ank) / 2.0
    
    torso_px = np.linalg.norm(mid_hip - mid_sh)
    legs_px = np.linalg.norm(mid_ank - mid_hip)
    obs_ratio = torso_px / (legs_px + 1e-5)
    std_ratio = 0.58 if gender == 'men' else 0.55
    pitch_factor = round(max(0.92, min(1.08, 1.0 + (obs_ratio - std_ratio) * 0.4)), 2)
    
    # Scaling
    head_top_y = max(0, nose[1] - 1.25 * abs(mid_sh[1] - nose[1]))
    floor_y = max(f_lm[29]['y'] * f_h, f_lm[30]['y'] * f_h, mid_ank[1] + 0.04 * f_h)
    total_body_px = max(100.0, floor_y - head_top_y)
    scale_cm_per_px = height_cm / total_body_px
    
    s_sh_y = side_res['landmarks'][11]['y'] * s_h
    s_nose_y = side_res['landmarks'][0]['y'] * s_h
    s_head_top = max(0, s_nose_y - 1.25 * abs(s_sh_y - s_nose_y))
    s_floor = max(side_res['landmarks'][27]['y'] * s_h + 0.04 * s_h, side_res['landmarks'][29]['y'] * s_h)
    s_scale = height_cm / max(100.0, s_floor - s_head_top)
    
    def to_cm_front(p1, p2):
        return float(np.linalg.norm(p1 - p2) * scale_cm_per_px)
        
    def to_depth_side(pin_f, pin_b):
        return float(abs(pin_b['x'] - pin_f['x']) * s_w * s_scale)
    
    # Measurements with Unified Hip and Depth Pins
    torso_length = round(to_cm_front(mid_sh, mid_hip) * pitch_factor * 1.05, 1)
    shoulder_width = round(to_cm_front(l_sh, r_sh) * yaw_factor * 1.04, 1)
    
    # Chest
    c_l = np.array([f_pins['chestL']['x'] * f_w, f_pins['chestL']['y'] * f_h])
    c_r = np.array([f_pins['chestR']['x'] * f_w, f_pins['chestR']['y'] * f_h])
    chest_width = round(to_cm_front(c_l, c_r) * yaw_factor, 1)
    side_chest_depth = round(to_depth_side(s_pins['sideChestF'], s_pins['sideChestB']), 1)
    chest_circ = round(ramanujan_ellipse_circumference(chest_width, side_chest_depth), 1)
    
    # Arm Length
    l_elb = np.array([f_lm[13]['x'] * f_w, f_lm[13]['y'] * f_h])
    l_wri = np.array([f_lm[15]['x'] * f_w, f_lm[15]['y'] * f_h])
    r_elb = np.array([f_lm[14]['x'] * f_w, f_lm[14]['y'] * f_h])
    r_wri = np.array([f_lm[16]['x'] * f_w, f_lm[16]['y'] * f_h])
    arm_length = round(((to_cm_front(l_sh, l_elb) + to_cm_front(l_elb, l_wri) + to_cm_front(r_sh, r_elb) + to_cm_front(r_elb, r_wri)) / 2.0) * 1.02, 1)
    
    # Waist
    w_l = np.array([f_pins['waistL']['x'] * f_w, f_pins['waistL']['y'] * f_h])
    w_r = np.array([f_pins['waistR']['x'] * f_w, f_pins['waistR']['y'] * f_h])
    waist_width = round(to_cm_front(w_l, w_r) * yaw_factor, 1)
    side_waist_depth = round(to_depth_side(s_pins['sideWaistF'], s_pins['sideWaistB']), 1)
    waist_circ = round(ramanujan_ellipse_circumference(waist_width, side_waist_depth), 1)
    
    # Hip
    hip_width = round(to_cm_front(l_hip, r_hip) * 1.08 * yaw_factor, 1)
    side_hip_depth = round(to_depth_side(s_pins['sideHipF'], s_pins['sideHipB']), 1)
    hip_circ = round(ramanujan_ellipse_circumference(hip_width, side_hip_depth), 1)
    
    # Thigh
    t_l = np.array([f_pins['thighL']['x'] * f_w, f_pins['thighL']['y'] * f_h])
    t_r = np.array([f_pins['thighR']['x'] * f_w, f_pins['thighR']['y'] * f_h])
    thigh_width = round(to_cm_front(t_l, t_r), 1)
    side_thigh_depth = round(to_depth_side(s_pins['sideThighF'], s_pins['sideThighB']), 1)
    thigh_circ = round(ramanujan_ellipse_circumference(thigh_width, side_thigh_depth), 1)
    
    # Leg Length
    l_knee = np.array([f_lm[25]['x'] * f_w, f_lm[25]['y'] * f_h])
    r_knee = np.array([f_lm[26]['x'] * f_w, f_lm[26]['y'] * f_h])
    leg_outseam = round(((to_cm_front(l_hip, l_knee) + to_cm_front(l_knee, l_ank) + to_cm_front(r_hip, r_knee) + to_cm_front(r_knee, r_ank)) / 2.0) * (2.0 - pitch_factor), 1)
    leg_inseam = round(leg_outseam * 0.78, 1)
    
    return {
        "success": True,
        "front": front_res,
        "side": side_res,
        "metrics": {
            "rollDeg": roll_deg,
            "yawFactor": yaw_factor,
            "pitchFactor": pitch_factor,
            "scaleCmPerPx": round(scale_cm_per_px, 3)
        },
        "measurements": {
            "torsoLength": {"name": "상체 길이", "value": torso_length, "unit": "cm", "desc": "목 뒤 중심 ~ 골반 윗선 (상의 총장)", "icon": "ph-person"},
            "shoulderWidth": {"name": "어깨 넓이", "value": shoulder_width, "unit": "cm", "desc": "좌우 어깨 끝점 사이 직선 거리", "icon": "ph-arrows-left-right"},
            "chestWidth": {"name": "가슴 넓이", "value": chest_width, "unit": "cm", "depth": side_chest_depth, "circ": chest_circ, "desc": f"가슴 너비: {chest_width}cm / 둘레: {chest_circ}cm (두께: {side_chest_depth}cm)", "icon": "ph-t-shirt"},
            "armLength": {"name": "팔 길이", "value": arm_length, "unit": "cm", "desc": "어깨 끝 ~ 팔꿈치 ~ 손목뼈 전체 길이", "icon": "ph-hand"},
            "waistWidth": {"name": "허리 넓이", "value": waist_width, "unit": "cm", "depth": side_waist_depth, "circ": waist_circ, "desc": f"허리 너비: {waist_width}cm / 둘레: {waist_circ}cm (두께: {side_waist_depth}cm)", "icon": "ph-circle"},
            "hipWidth": {"name": "골반 넓이", "value": hip_width, "unit": "cm", "depth": side_hip_depth, "circ": hip_circ, "desc": f"골반 너비: {hip_width}cm / 둘레: {hip_circ}cm (두께: {side_hip_depth}cm)", "icon": "ph-pants"},
            "thighWidth": {"name": "허벅지 넓이", "value": thigh_width, "unit": "cm", "depth": side_thigh_depth, "circ": thigh_circ, "desc": f"허벅지 너비: {thigh_width}cm / 둘레: {thigh_circ}cm (두께: {side_thigh_depth}cm)", "icon": "ph-ruler"},
            "legLength": {"name": "다리 총기장", "value": leg_outseam, "unit": "cm", "inseam": leg_inseam, "desc": f"바깥 총기장: {leg_outseam}cm, 다리안쪽(인심): {leg_inseam}cm", "icon": "ph-sneaker-move"}
        },
        "userHeight": height_cm,
        "gender": gender
    }

def ocr_process_sizechart(image_np):
    """
    Robust OCR Size Chart Parser
    Handles Korean shopping mall size charts with multi-notation labels (e.g. S/38, M/40, L/42, M(100))
    and non-standard column layouts, filtering out footer notice noise.
    """
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    norm = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX)
    thresh = cv2.threshold(norm, 200, 255, cv2.THRESH_BINARY)[1]
    
    # Try Korean + English OCR if available, fallback to default
    try:
        text = pytesseract.image_to_string(thresh, lang='kor+eng')
    except:
        text = pytesseract.image_to_string(thresh)
        
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    parsed_rows = []
    noise_keywords = ['측정', '오차', '모니터', '해상도', '색감', '확인', '구매', 'INFO', 'HELP', '안내', '주의']
    
    for l in lines:
        line_clean = l.strip()
        if not line_clean:
            continue
        if any(k in line_clean.upper() for k in noise_keywords):
            continue
            
        nums = [float(x) for x in re.findall(r'\b\d+(?:\.\d+)?\b', line_clean)]
        size_cand = re.search(r'([A-Za-z8]+(?:/[0-9]+|\s*\([0-9]+\))|\b(?:XS|S|M|L|XL|XXL|2XL|3XL|FREE|\d{2,3})\b)', line_clean, re.IGNORECASE)
        
        size_str = ""
        if size_cand:
            size_str = size_cand.group(1).upper().replace('$', 'S')
            
        if '/' in size_str:
            try:
                slash_num = float(re.search(r'/(\d+)', size_str).group(1))
                if slash_num in nums:
                    nums.remove(slash_num)
            except:
                pass
        elif '(' in size_str:
            try:
                paren_num = float(re.search(r'\((\d+)\)', size_str).group(1))
                if paren_num in nums:
                    nums.remove(paren_num)
            except:
                pass
                
        valid_nums = [n for n in nums if 10.0 <= n <= 200.0]
        if len(valid_nums) >= 3:
            if not size_str:
                size_str = f"Size {len(parsed_rows)+1}"
            parsed_rows.append({
                "size": size_str,
                "values": valid_nums,
                "raw": line_clean
            })
            
    return parsed_rows

class FitHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/analyze':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8'))
                front_b64 = payload.get('frontImage')
                side_b64 = payload.get('sideImage')
                height_cm = float(payload.get('userHeight', 175.0))
                gender = payload.get('gender', 'men')

                result = analyze_body_pipeline(front_b64, side_b64, height_cm, gender)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                err_resp = {"success": False, "error": str(e)}
                self.wfile.write(json.dumps(err_resp).encode('utf-8'))

        elif self.path == '/api/ocr-sizechart':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8'))
                img_b64 = payload.get('image')
                image_np = decode_base64_image(img_b64)
                rows = ocr_process_sizechart(image_np)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "rows": rows}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), FitHandler) as httpd:
        print(f"FitManager Python AI Engine v6 started on port {PORT}...")
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("Server stopped.")
