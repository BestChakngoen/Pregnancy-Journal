import HomeSection from "@/components/sections/HomeSection";
import HealthLogSection from "@/components/sections/HealthLogSection";
import TrackingSection from "@/components/sections/TrackingSection";
import EducationSection from "@/components/sections/EducationSection";
import ProfileSection from "@/components/sections/ProfileSection";

// ต้องตรงกับ navItems ใน BottomNav
const sections = [
  {
    id: "home",
    Component: () => (
      <>
        <HomeSection />
        <HealthLogSection />
      </>
    ),
  },
  { id: "tracking", Component: TrackingSection },
  { id: "education", Component: EducationSection },
  { id: "profile", Component: ProfileSection },
];

export default function Home() {
  return (
    // เว้นที่ให้แถบเมนูล่าง (และปุ่ม 3 ขีดในแนวนอน) — หน้าที่ซ่อนเมนูไม่ต้องเว้น
    <div className="pb-20 md:pb-0 phone-landscape:pb-0 phone-landscape:pt-12">
      {sections.map(({ id, Component }) => (
        // ส่วนสุดท้ายหักที่ว่างเมนูล่าง (pb-20 ด้านบน) ออก ไม่งั้นเลื่อนเลยเนื้อหาไปเจอพื้นที่ว่าง
        <section key={id} id={id} className="min-h-svh last:min-h-[calc(100svh-5rem)] md:last:min-h-svh phone-landscape:last:min-h-svh">
          {/* จอคอม: ทุกส่วนกว้างเท่ากันและอยู่กลาง */}
          <div className="md:max-w-5xl md:mx-auto">
            <Component />
          </div>
        </section>
      ))}
    </div>
  );
}
