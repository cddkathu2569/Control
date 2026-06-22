# สคริปต์แนะนำการใช้งานเซิร์ฟเวอร์หลังบ้านและการอัปขึ้นโฮสต์ Render
# ภาษาไทย UTF-8

Clear-Host
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   ระบบจัดการระบบหลังบ้านทะเบียนคุมเบิกจ่ายร้านค้า   " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# ตัวเลือกการใช้งาน
Write-Host "กรุณาเลือกรูปแบบที่ต้องการดำเนินการ:" -ForegroundColor Green
Write-Host " [1] รันแอปพลิเคชันภายในเครื่องคอมพิวเตอร์นี้ (Local Server)"
Write-Host " [2] เปิดคู่มือวิธีการอัปขึ้นโฮสต์ Render.com เพื่อใช้งานออนไลน์"
Write-Host " [3] บีบอัดไฟล์เว็บเวอร์ชันหลังบ้านใหม่ (อัปเดต ทะเบียนคุมเบิกจ่าย.zip)"
Write-Host " [4] ออกจากสคริปต์"
Write-Host ""

$choice = Read-Host "ป้อนตัวเลขตัวเลือก (1-4)"

if ($choice -eq "1") {
    Clear-Host
    Write-Host "⚡ กำลังตรวจสอบความพร้อมเพื่อรันเซิร์ฟเวอร์ในเครื่อง..." -ForegroundColor Yellow
    
    # เช็คว่ามี node.exe ไหม
    $nodeCheck = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCheck) {
        Write-Host "❌ ข้อผิดพลาด: ไม่พบโปรแกรม Node.js ในเครื่องคอมพิวเตอร์ของคุณ" -ForegroundColor Red
        Write-Host "โปรดดาวน์โหลดและติดตั้ง Node.js ก่อนจากลิงก์: https://nodejs.org/" -ForegroundColor White
        Write-Host "หลังจากติดตั้งเสร็จแล้ว ให้เปิดรันเมนูนี้ใหม่อีกครั้ง" -ForegroundColor White
        Write-Host ""
        Write-Host "กดปุ่มใดๆ เพื่อกลับสู่เมนู..." -ForegroundColor Gray
        $null = [System.Console]::ReadKey()
        powershell -ExecutionPolicy Bypass -File .\deploy.ps1
        exit
    }
    
    # รัน npm install ถ้ายังไม่มี node_modules
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 กำลังดาวน์โหลดไลบรารีที่จำเป็น (npm install)..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "🚀 กำลังสตาร์ทเซิร์ฟเวอร์หลังบ้าน (npm start)..." -ForegroundColor Green
    Write-Host "เมื่อเซิร์ฟเวอร์ทำงานแล้ว สามารถเปิดเบราว์เซอร์เข้าที่: http://localhost:3000" -ForegroundColor White
    Write-Host "ชื่อล็อกอินเริ่มต้น:" -ForegroundColor White
    Write-Host " - แอดมิน: admin / รหัส: admin1234" -ForegroundColor Yellow
    Write-Host " - พนักงาน: staff / รหัส: staff1234" -ForegroundColor Yellow
    Write-Host "--------------------------------------------------------" -ForegroundColor Gray
    Write-Host "ต้องการยกเลิกการเปิดเซิร์ฟเวอร์ ให้กดปุ่ม [Ctrl + C] บนคีย์บอร์ด" -ForegroundColor Red
    Write-Host "--------------------------------------------------------" -ForegroundColor Gray
    Write-Host ""
    
    # เปิดหน้าเว็บอัตโนมัติ
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000"
    
    # รันเซิร์ฟเวอร์
    npm start
}
elseif ($choice -eq "2") {
    Clear-Host
    Write-Host "📖 เปิดเว็บบราวเซอร์ไปยังหน้า Render.com..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    Start-Process "https://dashboard.render.com"
    
    Write-Host ""
    Write-Host "================ คู่มือย่อการอัปโหลดขึ้น Render ================" -ForegroundColor Cyan
    Write-Host "1. สมัครใช้งานหรือล็อกอินเข้าสู่เว็บ https://render.com" -ForegroundColor White
    Write-Host "2. สร้างเว็บเซอร์วิสใหม่ (New > Web Service)" -ForegroundColor White
    Write-Host "3. เชื่อมโยงบัญชี GitHub หรือใช้วิธีฝากซอร์สโค้ดใน GitHub" -ForegroundColor White
    Write-Host "   (หรืออัปโหลดไฟล์ในโครงการนี้ทั้งหมดขึ้น Git Repository ของคุณ)" -ForegroundColor White
    Write-Host "4. ตั้งค่าหน้าจอบน Render ดังนี้:" -ForegroundColor White
    Write-Host "   - Runtime: Node" -ForegroundColor Yellow
    Write-Host "   - Build Command: npm install" -ForegroundColor Yellow
    Write-Host "   - Start Command: node server.js" -ForegroundColor Yellow
    Write-Host "5. กดสร้าง (Create Web Service) และรอ Render ติดตั้งระบบประมาณ 2-3 นาที" -ForegroundColor White
    Write-Host "6. คุณจะได้ลิงก์เว็บสาธารณะ (เช่น https://app-name.onrender.com) เพื่อใช้ล็อกอินและทำงานออนไลน์ได้จากทุกที่!" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "กดปุ่มใดๆ เพื่อกลับสู่เมนู..." -ForegroundColor Gray
    $null = [System.Console]::ReadKey()
    powershell -ExecutionPolicy Bypass -File .\deploy.ps1
}
elseif ($choice -eq "3") {
    Clear-Host
    Write-Host "📦 กำลังบีบอัดไฟล์ระบบ (Backend + Frontend)..." -ForegroundColor Yellow
    Compress-Archive -Path index.html, style.css, app.js, server.js, db.js, package.json -DestinationPath ทะเบียนคุมเบิกจ่าย.zip -Force
    Write-Host "✅ อัปเดตไฟล์ 'ทะเบียนคุมเบิกจ่าย.zip' เรียบร้อย!" -ForegroundColor Green
    Write-Host ""
    Write-Host "กดปุ่มใดๆ เพื่อกลับสู่เมนู..." -ForegroundColor Gray
    $null = [System.Console]::ReadKey()
    powershell -ExecutionPolicy Bypass -File .\deploy.ps1
}
else {
    Write-Host "👋 ปิดระบบเรียบร้อย!" -ForegroundColor Yellow
}
