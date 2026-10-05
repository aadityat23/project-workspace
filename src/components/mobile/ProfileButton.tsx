import { Link } from "@tanstack/react-router";

import { getCurrentUser } from "@/lib/api";

export function ProfileButton() {
  const user = getCurrentUser();
  return (
    <Link to="/m/more" aria-label="More and profile" className="flex size-11 items-center justify-center">
      <span className="flex size-8 items-center justify-center rounded-full bg-navy text-[11.5px] font-semibold text-navy-foreground">
        {user.initials}
      </span>
    </Link>
  );
}
