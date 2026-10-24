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
    <>
      {sections.map(({ id, Component }) => (
        <section key={id} id={id} className="min-h-dvh">
          <Component />
        </section>
      ))}
    </>
  );
}
