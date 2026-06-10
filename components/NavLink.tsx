const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <a
      href={href}
      className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-cyan-500/10 hover:text-cyan-300"
    >
      {children}
    </a>
  );
};

export default NavLink;