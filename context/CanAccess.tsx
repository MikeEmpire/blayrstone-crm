import { ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface CanAccessProps {
  children: ReactNode;
  permission: "admin" | "staff-viewer" | "any";
  fallback?: ReactNode;
}

export function CanAccess({
  children,
  permission,
  fallback = null,
}: CanAccessProps) {
  const { isAdmin, isStaffViewer } = useAuth();

  const hasAccess = () => {
    switch (permission) {
      case "admin":
        return isAdmin();
      case "staff-viewer":
        return isStaffViewer() || isAdmin();
      case "any":
        return isAdmin() || isStaffViewer();
      default:
        return false;
    }
  };

  if (!hasAccess()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
