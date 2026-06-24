# =============================================================
# deploy.ps1 — ระบบทะเบียนคุมเบิกจ่ายร้านค้า (Version 3.0 Firebase)
# =============================================================

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ระบบทะเบียนคุมเบิกจ่ายร้านค้า — Version 3.0 Firebase  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "กรุณาเลือกรูปแบบที่ต้องการดำเนินการ:" -ForegroundColor Green
Write-Host " [1] เปิดเว็บไซต์ในเบราว์เซอร์ (เปิดไฟล์ admin.html โดยตรง)"
Write-Host " [2] คู่มือตั้งค่า Firebase + GitHub Pages (ครั้งแรก)"
Write-Host " [3] บีบอัดไฟล์สำหรับอัปโหลด GitHub Pages"
Write-Host " [4] ออกจากสคริปต์"
Write-Host ""

$choice = Read-Host "ป้อนตัวเลขตัวเลือก (1-4)"

if ($choice -eq "1") {
    Clear-Host
    Write-Host "🌐 กำลังเปิดเว็บไซต์ในเบราว์เซอร์..." -ForegroundColor Yellow
    $indexPath = Join-Path $PSScriptRoot "admin.html"
    if (Test-Path $indexPath) {
        Start-Process $indexPath
        Write-Host "✅ เปิดไฟล์: $indexPath" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  หมายเหตุ: หากเว็บไม่โหลดหรือแสดง error Firebase" -ForegroundColor Yellow
        Write-Host "    → ต้องเติมค่า firebaseConfig ใน firebase-config.js ก่อน" -ForegroundColor White
        Write-Host "    → ดูคู่มือ เลือกตัวเลือก [2]" -ForegroundColor White
    } else {
        Write-Host "❌ ไม่พบไฟล์ admin.html" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "กดปุ่มใดๆ เพื่อกลับสู่เมนู..." -ForegroundColor Gray
    $null = [System.Console]::ReadKey()
    powershell -ExecutionPolicy Bypass -File .\deploy.ps1
}
elseif ($choice -eq "2") {
    Clear-Host
    Write-Host "📖 คู่มือการตั้งค่า Firebase + GitHub Pages" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔥 ขั้นตอนที่ 1 — สร้าง Firebase Project" -ForegroundColor Yellow
    Write-Host "   1. เปิด https://console.firebase.google.com" -ForegroundColor White
    Write-Host "   2. คลิก [Add project] → ตั้งชื่อ เช่น 'thairat-register'" -ForegroundColor White
    Write-Host "   3. ปิด Google Analytics (ไม่จำเป็น) → [Create project]" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 ขั้นตอนที่ 2 — เปิดใช้ Authentication" -ForegroundColor Yellow
    Write-Host "   1. ในเมนูซ้าย คลิก [Authentication]" -ForegroundColor White
    Write-Host "   2. คลิก [Get started]" -ForegroundColor White
    Write-Host "   3. คลิก [Email/Password] → เปิด Enable → [Save]" -ForegroundColor White
    Write-Host "   4. ไปที่แท็บ [Users] → [Add user]" -ForegroundColor White
    Write-Host "   5. ใส่อีเมลและรหัสผ่านของ Admin เช่น:" -ForegroundColor White
    Write-Host "      Email: admin@thairat.local" -ForegroundColor Green
    Write-Host "      Password: Admin@1234 (ตั้งรหัสที่ปลอดภัย)" -ForegroundColor Green
    Write-Host "   6. คัดลอก User UID ที่สร้างมา (จะใช้ในขั้นตอนที่ 3)" -ForegroundColor White
    Write-Host ""
    Write-Host "🗄️  ขั้นตอนที่ 3 — สร้าง Firestore Database" -ForegroundColor Yellow
    Write-Host "   1. ในเมนูซ้าย คลิก [Firestore Database]" -ForegroundColor White
    Write-Host "   2. คลิก [Create database]" -ForegroundColor White
    Write-Host "   3. เลือก Region: asia-southeast1 (Singapore)" -ForegroundColor White
    Write-Host "   4. เลือก [Start in test mode] → [Enable]" -ForegroundColor White
    Write-Host "   5. สร้าง Collection 'users' → เพิ่ม Document ID = UID ของ Admin" -ForegroundColor White
    Write-Host "      Fields:" -ForegroundColor White
    Write-Host "        email      = admin@thairat.local (string)" -ForegroundColor Green
    Write-Host "        displayName = ผู้ดูแลระบบ (Admin) (string)" -ForegroundColor Green
    Write-Host "        role       = admin (string)" -ForegroundColor Green
    Write-Host "        disabled   = false (boolean)" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚙️  ขั้นตอนที่ 4 — คัดลอก firebaseConfig" -ForegroundColor Yellow
    Write-Host "   1. ไปที่ [Project Settings] (ไอคอน ⚙️ ด้านบนซ้าย)" -ForegroundColor White
    Write-Host "   2. เลื่อนลงไปที่ 'Your apps' → คลิก </> (Web)" -ForegroundColor White
    Write-Host "   3. ใส่ชื่อ App เช่น 'web' → [Register app]" -ForegroundColor White
    Write-Host "   4. คัดลอก firebaseConfig ทั้งหมด" -ForegroundColor White
    Write-Host "   5. เปิดไฟล์ firebase-config.js แล้ววางค่าที่คัดลอกมา" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 ขั้นตอนที่ 5 — อัปโหลดขึ้น GitHub Pages" -ForegroundColor Yellow
    Write-Host "   1. สร้าง Repository ใหม่ใน GitHub (Public)" -ForegroundColor White
    Write-Host "   2. อัปโหลดไฟล์เหล่านี้ขึ้น Repository:" -ForegroundColor White
    Write-Host "      - admin.html" -ForegroundColor Green
    Write-Host "      - app.js" -ForegroundColor Green
    Write-Host "      - style.css" -ForegroundColor Green
    Write-Host "      - firebase-config.js (ที่ใส่ค่าแล้ว)" -ForegroundColor Green
    Write-Host "   3. ไปที่ Settings → Pages → Source: Deploy from branch → main / root" -ForegroundColor White
    Write-Host "   4. รอสักครู่ จะได้ URL เช่น https://username.github.io/repo-name" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  สำคัญ: เพิ่ม Domain ใน Firebase Authentication" -ForegroundColor Red
    Write-Host "   1. ไปที่ Authentication → Settings → Authorized domains" -ForegroundColor White
    Write-Host "   2. เพิ่ม Domain ของ GitHub Pages เช่น username.github.io" -ForegroundColor White
    Write-Host ""

    Start-Process "https://console.firebase.google.com"
    Write-Host "เปิด Firebase Console ในเบราว์เซอร์แล้ว!" -ForegroundColor Green
    Write-Host ""
    Write-Host "กดปุ่มใดๆ เพื่อกลับสู่เมนู..." -ForegroundColor Gray
    $null = [System.Console]::ReadKey()
    powershell -ExecutionPolicy Bypass -File .\deploy.ps1
}
elseif ($choice -eq "3") {
    Clear-Host
    Write-Host "📦 กำลังบีบอัดไฟล์สำหรับ GitHub Pages..." -ForegroundColor Yellow
    
    # ตรวจสอบว่ามีการใส่ค่า Firebase Config แล้วหรือยัง
    $configContent = Get-Content "firebase-config.js" -ErrorAction SilentlyContinue
    if ($configContent -match "PASTE_YOUR_API_KEY_HERE") {
        Write-Host "❌ คำเตือน: ยังไม่ได้กรอกค่า firebaseConfig ในไฟล์ firebase-config.js!" -ForegroundColor Red
        Write-Host "   กรุณาใส่ค่าจาก Firebase Console ก่อนอัปโหลด (ดูคู่มือ เลือก [2])" -ForegroundColor Yellow
        Write-Host ""
    }
    
    Compress-Archive -Path admin.html, style.css, app.js, firebase-config.js -DestinationPath ทะเบียนคุมเบิกจ่าย_github_pages.zip -Force
    Write-Host "✅ สร้างไฟล์ 'ทะเบียนคุมเบิกจ่าย_github_pages.zip' สำเร็จ!" -ForegroundColor Green
    Write-Host ""
    Write-Host "ไฟล์ที่รวมอยู่ใน zip:" -ForegroundColor White
    Write-Host "  ✓ admin.html" -ForegroundColor Green
    Write-Host "  ✓ style.css" -ForegroundColor Green
    Write-Host "  ✓ app.js (Firebase Version)" -ForegroundColor Green
    Write-Host "  ✓ firebase-config.js (ตรวจสอบให้แน่ใจว่าใส่ค่าแล้ว)" -ForegroundColor Green
    Write-Host ""
    Write-Host "กดปุ่มใดๆ เพื่อกลับสู่เมนู..." -ForegroundColor Gray
    $null = [System.Console]::ReadKey()
    powershell -ExecutionPolicy Bypass -File .\deploy.ps1
}
else {
    Write-Host "👋 ปิดระบบเรียบร้อย!" -ForegroundColor Yellow
}
