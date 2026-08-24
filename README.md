# ⚡ ThunderGo (RiderTask)

> **ThunderGo** เป็นแอปพลิเคชันให้บริการรับ-ส่งพัสดุและสินค้าแบบ Real-time บนสมาร์ตโฟน (iOS & Android) ที่พัฒนาด้วย **React Native**, **Expo Router** และ **Firebase** รองรับการใช้งานแบบแยก 2 บทบาทหลักในระบบเดียว ได้แก่ **ผู้ส่งพัสดุ (Sender)** และ **ไรเดอร์ผู้รับงาน (Rider)**

---

## 📱 ฟีเจอร์หลักของระบบ (Key Features)

### 📦 1. ฝั่งผู้ส่งพัสดุ (Sender)
* **หน้าหลักและแดชบอร์ด (Dashboard & Live Tracking):** แสดงแผนที่และติดตามสถานะการจัดส่งพัสดุแบบ Real-time
* **สร้างรายการส่งพัสดุ (Create Order):**
  * ค้นหาและปักหมุดจุดรับ-จุดส่งบนแผนที่ด้วยระบบ `react-native-maps`
  * อัปโหลดรูปภาพพัสดุเพื่อใช้เป็นหลักฐานและข้อมูลประกอบ
  * คำนวณระยะทางและประเมินค่าบริการอัตโนมัติ
* **การจัดการออเดอร์ (Order Management):** ดูรายการออเดอร์ทั้งหมด พร้อมระบบกรองสถานะ (กำลังดำเนินการ / สำเร็จ / ยกเลิก)
* **แชทในแอป (In-App Chat):** ระบบส่งข้อความสื่อสารกับไรเดอร์แบบ Real-time ผ่าน Firebase Firestore
* **กระเป๋าเงิน (Wallet System):** เติมเงิน ถอนเงิน และดูประวัติการทำธุรกรรม
* **โปรไฟล์และการตั้งค่า (Profile & Settings):** จัดการข้อมูลส่วนตัว, ภาษา, ความปลอดภัย และอันดับผู้ใช้งาน (Ranking)

### 🛵 2. ฝั่งไรเดอร์ (Rider)
* **แดชบอร์ดและสวิตช์รับงาน (Tasks & Status Switch):**
  * เปิด/ปิด สถานะพร้อมรับงาน (Online/Offline)
  * แสดงรายการงานที่เปิดรับอยู่บริเวณใกล้เคียงบนแผนที่แบบ Real-time
* **ระบบนำทางและการส่งมอบ (Navigation & Proof of Delivery):**
  * แสดงเส้นทางไปยังจุดรับพัสดุและจุดส่งพัสดุ
  * อัปเดตสถานะงาน (กดรับงาน -> กำลังไปรับ -> รับของแล้ว -> กำลังส่ง -> ส่งสำเร็จ)
  * ถ่ายภาพ/อัปโหลดรูปภาพพัสดุขณะส่งสำเร็จเพื่อบันทึกเป็นหลักฐาน
* **รายได้และสถิติ (Earnings & Performance):**
  * สรุปรายได้ประจำวัน / ประจำสัปดาห์
  * ระบบจัดอันดับไรเดอร์ (Ranking) และสถิติการรับงาน
* **การจัดการยานพาหนะ (Vehicle Management):** เพิ่มและแก้ไขข้อมูลยานพาหนะ เช่น รถจักรยานยนต์ หรือ รถยนต์

### 🔐 3. ระบบความปลอดภัยและการยืนยันตัวตน (Authentication & Persistence)
* สมัครสมาชิกและเข้าสู่ระบบด้วยการเลือกบทบาท (Sender / Rider)
* ระบบจดจำการล็อกอินอัตโนมัติด้วย `@react-native-async-storage/async-storage`

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนประกอบ | เทคโนโลยี / ไลบรารี |
| :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) (v0.81), [Expo](https://expo.dev/) (v54) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based Routing) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Backend & Cloud** | [Firebase](https://firebase.google.com/) (Authentication, Firestore Database, Cloud Storage) |
| **Maps & Location** | `react-native-maps`, `expo-location` |
| **UI & Animations** | `@gorhom/bottom-sheet`, `react-native-reanimated`, `expo-image`, `@expo/vector-icons` |
| **Local Storage** | `@react-native-async-storage/async-storage` |

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
RiderTask/
├── app/                        # Expo Router Structure (File-based Routing)
│   ├── (auth)/                 # หน้าเข้าสู่ระบบและสมัครสมาชิก (Login / Register)
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (rider)/                # หน้าการทำงานฝั่งไรเดอร์ (Rider Screens)
│   │   ├── index.tsx           # หน้าหลักไรเดอร์ (รายการงานที่กดรับได้)
│   │   ├── map.tsx             # แผนที่นำทางไรเดอร์
│   │   ├── history.tsx         # ประวัติการรับงาน
│   │   ├── income.tsx          # สรุปรายได้
│   │   ├── vehicles.tsx        # จัดการยานพาหนะ
│   │   └── profile.tsx         # โปรไฟล์ไรเดอร์
│   ├── (sender)/               # หน้าการทำงานฝั่งผู้ส่ง (Sender Screens)
│   │   ├── index.tsx           # หน้าหลักผู้ส่ง (ติดตามสถานะพัสดุ)
│   │   ├── create-order.tsx    # หน้าสร้างออเดอร์ใหม่
│   │   ├── map-picker.tsx      # หน้าเลือกจุดรับ-ส่งบนแผนที่
│   │   ├── orders.tsx          # รายการออเดอร์ทั้งหมด
│   │   ├── wallet.tsx          # กระเป๋าเงิน
│   │   └── profile.tsx         # โปรไฟล์ผู้ส่ง
│   ├── _layout.tsx             # Main Root Layout & Navigation Stack
│   └── index.tsx               # Entry Splash / Auth Check Screen
├── components/                 # Shared Components
│   ├── OrderCard.tsx           # การ์ดแสดงข้อมูลออเดอร์
│   ├── Skeleton.tsx            # UI โหลดดิ้ง (Loading Skeleton)
│   └── ui/                     # Reusable UI Elements (Buttons, Inputs, Modals)
├── services/                   # Service Layer & APIs
│   ├── firebase.ts             # Firebase Config & Initialization
│   ├── authService.ts          # ระบบล็อกอิน / สมัครสมาชิก / Session Management
│   ├── orderService.ts        # การจัดการออเดอร์และแชท (Firestore CRUD)
│   └── storageService.ts       # การอัปโหลดรูปภาพ (Firebase Storage)
├── constants/                  # Colors, Fonts, Config Constants
├── assets/                     # Images, Icons, Fonts
└── grading_criteria.md         # เอกสารอ้างอิงเกณฑ์การให้คะแนนและตำแหน่งโค้ด
```

---

## 📊 ตารางอ้างอิงเกณฑ์การพัฒนา (Grading Criteria Reference)

| หัวข้อเกณฑ์ | รายละเอียด | ตำแหน่งในโค้ด |
| :--- | :--- | :--- |
| **1. `nav` (Navigation)** | การนำทางด้วย Expo Router (File-based Routing) และ Tab Bar | [`app/(rider)/_layout.tsx`](file:///c:/Portfolio/RiderTask/app/(rider)/_layout.tsx), [`app/(sender)/_layout.tsx`](file:///c:/Portfolio/RiderTask/app/(sender)/_layout.tsx) |
| **2. `home` (Home Screen)** | หน้าแดชบอร์ดหลักของแต่ละบทบาทผู้ใช้ | [`app/(sender)/index.tsx`](file:///c:/Portfolio/RiderTask/app/(sender)/index.tsx), [`app/(rider)/index.tsx`](file:///c:/Portfolio/RiderTask/app/(rider)/index.tsx) |
| **3. `flatlist` (FlatList)** | การแสดงผลรายการออเดอร์ พร้อม Pull-to-Refresh & Empty Component | [`app/(sender)/orders.tsx`](file:///c:/Portfolio/RiderTask/app/(sender)/orders.tsx), [`app/(rider)/history.tsx`](file:///c:/Portfolio/RiderTask/app/(rider)/history.tsx) |
| **4. `fetch` (Data Fetching)** | การอ่านไฟล์ภาพ Local URI และแปลงเป็น Blob ด้วย `fetch()` | [`services/storageService.ts`](file:///c:/Portfolio/RiderTask/services/storageService.ts) (`uploadImageAsync`) |
| **5. `Async` (Async/Await)** | การทำงานแบบ Asynchronous และการบันทึก Session ด้วย AsyncStorage | [`services/authService.ts`](file:///c:/Portfolio/RiderTask/services/authService.ts), [`services/orderService.ts`](file:///c:/Portfolio/RiderTask/services/orderService.ts) |
| **6. `map` (Maps System)** | แผนที่และการปักหมุดตำแหน่งพัสดุ / เส้นทาง | [`app/(sender)/map-picker.tsx`](file:///c:/Portfolio/RiderTask/app/(sender)/map-picker.tsx), [`app/(rider)/map.tsx`](file:///c:/Portfolio/RiderTask/app/(rider)/map.tsx) |
| **7. `database` (Firestore)** | Real-time NoSQL Database สำหรับออเดอร์, ยูสเซอร์ และแชท | [`services/firebase.ts`](file:///c:/Portfolio/RiderTask/services/firebase.ts), [`services/orderService.ts`](file:///c:/Portfolio/RiderTask/services/orderService.ts) |
| **8. `storage` (Cloud Storage)** | ระบบจัดเก็บและอัปโหลดรูปภาพพัสดุและรูปโปรไฟล์ | [`services/storageService.ts`](file:///c:/Portfolio/RiderTask/services/storageService.ts) |

---

## 🚀 การติดตั้งและเปิดใช้งาน (Setup & Installation)

### 1. ความต้องการของระบบ (Prerequisites)
* Node.js (แนะนำ version LTS เช่น v18 ขึ้นไป)
* npm หรือ yarn
* แอปพลิเคชัน **Expo Go** บนสมาร์ตโฟน (iOS / Android) หรือ Android Emulator / iOS Simulator

### 2. ขั้นตอนการติดตั้ง (Installation Steps)

1. **ติดตั้ง Dependencies:**
   ```bash
   npm install
   ```

2. **การตั้งค่า Firebase:**
   ตรวจสอบไฟล์ [`services/firebase.ts`](file:///c:/Portfolio/RiderTask/services/firebase.ts) และระบุค่า `firebaseConfig` ให้ตรงกับโปรเจกต์ Firebase ของคุณ:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

3. **เริ่มต้นรันแอปพลิเคชัน (Start Dev Server):**
   ```bash
   npx expo start
   ```

4. **คำสั่งสำหรับรันเฉพาะแพลตฟอร์ม:**
   * **Android:** `npm run android` หรือ กด `a` ใน Expo Terminal
   * **iOS:** `npm run ios` หรือ กด `i` ใน Expo Terminal
   * **Web Browser:** `npm run web` หรือ กด `w` ใน Expo Terminal

---

## 📄 ใบอนุญาต (License)

โปรเจกต์นี้จัดทำขึ้นเพื่อการศึกษาและสะสมผลงาน (Portfolio Project)
