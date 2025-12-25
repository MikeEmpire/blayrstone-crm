import { useAuth } from "@/context/AuthContext";

export function usePermissions() {
  const { isAdmin, isStaffViewer } = useAuth();

  return {
    // Client permissions
    canViewClients: () => true, // All authenticated users
    canCreateClient: () => isAdmin(),
    canEditClient: () => isAdmin(),
    canDeleteClient: () => isAdmin(),

    // Service Worker permissions
    canViewWorkers: () => true,
    canCreateWorker: () => isAdmin(),
    canEditWorker: () => isAdmin(),
    canDeleteWorker: () => isAdmin(),

    // Appointment permissions
    canViewAppointments: () => true,
    canCreateAppointment: () => isAdmin(),
    canEditAppointment: () => true, // Both admin and staff viewer
    canDeleteAppointment: () => isAdmin(),
    canCompleteAppointment: () => true, // Both can complete
    canCancelAppointment: () => true, // Both can cancel

    // General permissions
    isAdmin: () => isAdmin(),
    isStaffViewer: () => isStaffViewer(),
  };
}
