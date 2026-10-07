export type AdminRole =
  | "owner"
  | "editor";

export type AdminTeamMember = {
  userId: string;
  displayName: string;
  role: AdminRole;
  productCount: number;
};

export function canManageOffer({
  currentUserId,
  currentRole,
  ownerModeActive,
  productOwnerId,
}: {
  currentUserId: string;
  currentRole: AdminRole;
  ownerModeActive: boolean;
  productOwnerId:
    | string
    | null;
}) {
  if (
    !ownerModeActive
  ) {
    return true;
  }

  if (
    currentRole ===
    "owner"
  ) {
    return true;
  }

  return (
    productOwnerId ===
    currentUserId
  );
}

export function getAdminRoleLabel(
  role: AdminRole
) {
  return role ===
    "owner"
    ? "Właściciel"
    : "Administrator";
}