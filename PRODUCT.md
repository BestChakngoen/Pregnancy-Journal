# Product Truths

**Name:** Bumply
**Type:** Web Application (Mobile-first)
**Purpose:** Pregnancy tracking and maternal safety monitoring.

## Target Audience
- Pregnant mothers (primary).
- Needs to be highly accessible, reassuring, and easy to use with one hand on mobile devices.

## Core Value Proposition
- Provides an easy-to-understand visual representation of pregnancy progress.
- Educates mothers on baby development (fruit size comparisons, daily tips).
- **Critical Safety:** Acts as a first line of defense by logging symptoms and alerting users (Red Flag Alerts) to seek immediate medical attention if dangerous symptoms occur.

## Core Features (อ้างอิงจากแผนงานหลัก)
1. **ระบบ Authentication:** 
   - Anonymous Login ผ่าน Firebase (ใช้ชื่อเข้าสู่ระบบซ้ำได้โดยเช็คชื่อไม่ให้ซ้ำกัน)
2. **Onboarding (เก็บข้อมูลส่วนตัว):** 
   - ชื่อ, อายุ, อายุครรภ์, จำนวนครั้งการตั้งครรภ์ (Gravida)
3. **ระบบประเมินความเสี่ยง:** 
   - ทำแบบประเมิน, สรุปผลรวมคะแนน, และสรุปความเสี่ยงรายข้อ
4. **ศูนย์รวมความรู้ (Education Hub):** 
   - Pre-test / Post-test วัดความรู้
   - ลิงก์ E-book (Heyzine) และวิดีโอความรู้
   - แบบประเมินความพึงพอใจ
5. **ระบบติดตามสุขภาพ:** 
   - บันทึกความดันโลหิตสูง (และบันทึกอาการ Symptom Logger)
6. **Admin Dashboard:**
   - สำหรับเจ้าหน้าที่ดูข้อมูลหลังบ้านและ Export เป็น PDF
7. **Infrastructure:**
   - Deploy ขึ้น Netlify
