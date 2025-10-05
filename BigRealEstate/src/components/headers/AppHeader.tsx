import clsx from "clsx";
import { useAppNavigation } from "../../hooks";

export const AppHeader = () => {
  const { location, navigate } = useAppNavigation();
  const navLinks = [
    {
      title: "Home",
      link: "/home",
    },
    {
      title: "Project",
      link: "/project",
    },
    {
      title: "4-Up",
      link: "/FourUp",
    },
    {
      title: "Hours",
      link: "/hours",
    },
  ];

  return (
    <div className="w-full flex flex-row items-center justify-between p-4">
      <div>
        <p className="text-2xl font-bold cursor-pointer">
          <span className="text-4xl inline">Big</span> Real Estate
        </p>
      </div>

      <div className="flex flex-row">
        {navLinks.map((navLink) => (
          <p
            key={navLink.title}
            className={clsx(
              "text-xl cursor-pointer min-w-[100px] hover:font-bold",
              location.pathname.includes(navLink.link.replace("/", "")) &&
                "font-bold"
            )}
            onClick={() => navigate(navLink.link)}
          >
            {navLink.title}
          </p>
        ))}
      </div>
    </div>
  );
};
