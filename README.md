# FitManager - 웹 애플리케이션 실행 가이드 (초보자용)

## 📌 방법 1: 가장 간단한 방법 (브라우저로 바로 열기)
1. 다운로드받은 `fitmanager` 폴더를 엽니다.
2. `index.html` 파일을 더블 클릭(또는 마우스 우클릭 -> Chrome/Edge 브라우저로 열기)합니다.
3. 바로 웹앱이 브라우저에서 실행됩니다!

---

## 📌 방법 2: 로컬 웹 서버 실행 (권장)

### [Windows 사용자]
1. `fitmanager` 폴더 안에 있는 `run_windows.bat` 파일을 더블 클릭합니다.
2. 검은색 터미널 창이 뜨면서 기본 웹 브라우저에 `http://localhost:8080` 창이 자동으로 열립니다.
3. 서비스 종료 시 터미널 창을 닫아주시면 됩니다.

### [Mac / macOS 사용자]
1. `터미널(Terminal)` 앱을 엽니다.
2. `cd` 명령어로 fitmanager 폴더로 이동합니다.
   ```bash
   cd ~/Downloads/fitmanager  # (폴더 위치에 맞게 입력)
   python3 -m http.server 8080
   ```
3. 웹 브라우저(크롬, 사파리 등)를 켜고 주소창에 `http://localhost:8080` 을 입력합니다.

---

## 📌 방법 3: VS Code (Visual Studio Code) 이용 시
1. VS Code로 `fitmanager` 폴더를 엽니다.
2. 좌측 확장(Extensions) 탭에서 **Live Server**를 설치합니다.
3. `index.html` 파일에서 마우스 우클릭 후 **Open with Live Server**를 클릭합니다.
