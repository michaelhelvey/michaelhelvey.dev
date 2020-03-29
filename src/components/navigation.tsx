import Link from "next/link";
import {
  DetailedHTMLProps,
  AnchorHTMLAttributes,
  useState,
  MouseEvent,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/router";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const getRoutes = (currentPath: string) => {
  const routes = [
    { title: "Blog", href: "/", active: currentPath === "/" },
    {
      title: "Reading",
      href: "/reading",
      active: currentPath === "/reading",
    },
  ];

  return routes;
};

export default function Navigation() {
  const router = useRouter();
  const [showingMobileMenu, setShowingMobileMenu] = useState(false);

  const routes = useMemo(() => getRoutes(router.pathname), [router.pathname]);

  const toggleMobileMenu = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setShowingMobileMenu(!showingMobileMenu);
  };

  return (
    <div className="w-full flex flex-col items-center border-b border-gray-300">
      <div className="w-full max-w-5xl py-5 px-6 flex justify-between">
        <div className="flex items-center">
          <img
            src="/profile_picture.png"
            className="w-10 h-10 rounded-full"
            alt="Avatar"
          />
          <span className="px-3 font-bold tracking-wide text-green-800">
            michaelhelvey.dev
          </span>
        </div>
        <ul className="hidden md:flex font-semibold items-center tracking-wide text-gray-800">
          {routes.map((route) => (
            <li key={`route-${route.href}`} className="flex items-center">
              <Link href={route.href} passHref>
                <NavLink active={route.active}>{route.title}</NavLink>
              </Link>
            </li>
          ))}
          <li>
            <NavLink
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/michaelhelvey"
            >
              Code
            </NavLink>
          </li>
        </ul>
        <div className="flex md:hidden">
          <button onClick={toggleMobileMenu} className="active:outline-none">
            <FontAwesomeIcon
              icon={showingMobileMenu ? "times" : "bars"}
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>
      <MobileMenu open={showingMobileMenu} />
    </div>
  );
}

const NavLink = ({
  children,
  active,
  ...rest
}: DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> & { children: React.ReactNode; active?: boolean }) => {
  return (
    <a
      className={classnames(
        "px-3 hover:text-green-800 transition-colors duration-500 ease-in-out cursor-pointer",
        { "text-green-800": active }
      )}
      {...rest}
    >
      {children}
    </a>
  );
};

const MobileMenu = ({ open }: { open: boolean }) => {
  const el = useRef(null);
  const router = useRouter();

  const routes = useMemo(() => getRoutes(router.pathname), [router.pathname]);

  useEffect(() => {
    const container: HTMLDivElement = el.current as any;

    if (!container) {
      return;
    }

    const sectionHeight = container.scrollHeight;

    if (open) {
      container.style.height = sectionHeight + "px";
    } else {
      container.style.height = 0 + "px";
    }
  }, [open]);

  return (
    <div
      ref={el}
      className="transition-height duration-300 ease-out h-auto overflow-hidden px-6 w-full"
    >
      <ul className="flex flex-col justify-start pb-4">
        {routes.map((route) => (
          <li key={`route-${route.href}`} className="flex items-center py-2">
            <Link href={route.href} passHref>
              <NavLink active={route.active}>{route.title}</NavLink>
            </Link>
          </li>
        ))}
        <li className="py-2">
          <NavLink
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/michaelhelvey"
          >
            Code
          </NavLink>
        </li>
      </ul>
    </div>
  );
};
