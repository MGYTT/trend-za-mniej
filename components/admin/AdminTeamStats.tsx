"use client";

import {
  useEffect,
  useMemo,
} from "react";

import {
  useRouter,
} from "next/navigation";

import type {
  AdminRole,
} from "@/lib/admin-permissions";

export type AdminStatsMember = {
  userId: string;

  displayName:
    string;

  role:
    AdminRole;

  totalProducts:
    number;

  activeProducts:
    number;

  addedLast7Days:
    number;

  addedLast30Days:
    number;

  lastProductAt:
    | string
    | null;

  lastSeenAt:
    | string
    | null;

  currentPath:
    | string
    | null;
};

export type AdminActivityEntry = {
  id: number;

  actorId:
    | string
    | null;

  productName:
    string;

  action:
    | "created"
    | "updated"
    | "deleted";

  changedFields:
    string[];

  createdAt:
    string;
};

type Props = {
  members:
    AdminStatsMember[];

  recentActivity:
    AdminActivityEntry[];

  canSeeTeam:
    boolean;
};

export default function AdminTeamStats({
  members,
  recentActivity,
  canSeeTeam,
}: Props) {
  const router =
    useRouter();

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          if (
            document.visibilityState ===
            "visible"
          ) {
            router.refresh();
          }
        },
        60_000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    router,
  ]);

  const memberNames =
    useMemo(
      () =>
        new Map(
          members.map(
            (
              member
            ) => [
              member.userId,
              member.displayName,
            ]
          )
        ),
      [
        members,
      ]
    );

  const onlineCount =
    members.filter(
      (
        member
      ) =>
        getPresenceStatus(
          member.lastSeenAt
        ).online
    ).length;

  const totalProducts =
    members.reduce(
      (
        total,
        member
      ) =>
        total +
        member.totalProducts,
      0
    );

  const addedLast30Days =
    members.reduce(
      (
        total,
        member
      ) =>
        total +
        member.addedLast30Days,
      0
    );

  const lastProductAt =
    getNewestDate(
      members
        .map(
          (
            member
          ) =>
            member.lastProductAt
        )
        .filter(
          Boolean
        ) as string[]
    );

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label={
            canSeeTeam
              ? "Administratorzy"
              : "Twoje konto"
          }
          value={
            members.length
          }
          detail={
            canSeeTeam
              ? `${onlineCount} aktywnych teraz`
              : onlineCount >
                0
                ? "Aktywny teraz"
                : "Offline"
          }
        />

        <SummaryCard
          label="Oferty"
          value={
            totalProducts
          }
          detail="przypisane do zespołu"
        />

        <SummaryCard
          label="Ostatnie 30 dni"
          value={
            addedLast30Days
          }
          detail="nowych ofert"
        />

        <SummaryCard
          label="Ostatnia oferta"
          value="—"
          detail={
            lastProductAt
              ? formatRelativeTime(
                  lastProductAt
                )
              : "brak danych"
          }
          compact
        />
      </section>

      <section className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-600">
            Aktywność
          </p>

          <h2 className="mt-1 text-xl font-black text-stone-900">
            {canSeeTeam
              ? "Status administratorów"
              : "Twoje statystyki"}
          </h2>

          <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6">
            Status jest aktualizowany
            podczas korzystania
            z panelu administratora.
          </p>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {members.map(
            (
              member
            ) => (
              <AdminMemberStatsCard
                key={
                  member.userId
                }
                member={
                  member
                }
              />
            )
          )}
        </div>
      </section>

      {recentActivity.length >
        0 && (
        <section className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-600">
              Historia
            </p>

            <h2 className="mt-1 text-xl font-black text-stone-900">
              Ostatnie działania
            </h2>

            <p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6">
              Najnowsze zmiany
              dotyczące produktów.
            </p>
          </div>

          <div className="mt-4 divide-y divide-stone-100">
            {recentActivity.map(
              (
                activity
              ) => (
                <div
                  key={
                    activity.id
                  }
                  className="flex gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-rose-600">
                    <ActivityIcon
                      action={
                        activity.action
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-stone-800">
                          {getActivityLabel(
                            activity
                          )}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-stone-500">
                          {
                            activity.productName
                          }
                        </p>
                      </div>

                      <p className="shrink-0 text-[10px] font-semibold text-stone-400 sm:text-xs">
                        {formatRelativeTime(
                          activity.createdAt
                        )}
                      </p>
                    </div>

                    <p className="mt-1 text-[10px] text-stone-400 sm:text-xs">
                      {
                        activity.actorId
                          ? memberNames.get(
                              activity.actorId
                            ) ??
                            "Administrator"
                          : "System"
                      }
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function AdminMemberStatsCard({
  member,
}: {
  member:
    AdminStatsMember;
}) {
  const presence =
    getPresenceStatus(
      member.lastSeenAt
    );

  return (
    <article className="rounded-[18px] border border-stone-200 bg-stone-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-black text-stone-900">
              {
                member.displayName
              }
            </h3>

            <span
              className={[
                "rounded-full px-2.5 py-1 text-[9px] font-black",
                member.role ===
                "owner"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-blue-100 text-blue-700",
              ].join(
                " "
              )}
            >
              {member.role ===
              "owner"
                ? "👑 Właściciel"
                : "Administrator"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black",
                presence.online
                  ? "bg-emerald-100 text-emerald-800"
                  : presence.recent
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-200 text-stone-600",
              ].join(
                " "
              )}
            >
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  presence.online
                    ? "bg-emerald-500"
                    : presence.recent
                      ? "bg-amber-500"
                      : "bg-stone-400",
                ].join(
                  " "
                )}
              />

              {
                presence.label
              }
            </span>

            {member.lastSeenAt && (
              <span className="text-[10px] font-semibold text-stone-400">
                {formatRelativeTime(
                  member.lastSeenAt
                )}
              </span>
            )}
          </div>
        </div>

        {presence.online &&
          member.currentPath && (
          <span className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-[9px] font-black text-stone-500 shadow-sm">
            {getPageLabel(
              member.currentPath
            )}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniStat
          value={
            member.totalProducts
          }
          label="Wszystkie"
        />

        <MiniStat
          value={
            member.activeProducts
          }
          label="Aktywne"
        />

        <MiniStat
          value={
            member.addedLast7Days
          }
          label="7 dni"
        />

        <MiniStat
          value={
            member.addedLast30Days
          }
          label="30 dni"
        />
      </div>

      <div className="mt-4 border-t border-stone-200 pt-3">
        <p className="text-[10px] font-black uppercase tracking-[0.08em] text-stone-400">
          Ostatnio dodana oferta
        </p>

        <p className="mt-1 text-xs font-bold text-stone-700">
          {member.lastProductAt
            ? formatDateTime(
                member.lastProductAt
              )
            : "Brak przypisanych ofert"}
        </p>
      </div>
    </article>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  compact = false,
}: {
  label: string;
  value:
    | number
    | string;
  detail: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400">
        {label}
      </p>

      {!compact && (
        <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-stone-900">
          {value}
        </p>
      )}

      <p
        className={[
          compact
            ? "mt-2 text-sm font-black text-stone-800"
            : "mt-1 text-[10px] text-stone-400",
        ].join(
          " "
        )}
      >
        {detail}
      </p>
    </div>
  );
}

function MiniStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-lg font-black tracking-[-0.03em] text-stone-900">
        {value}
      </p>

      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-stone-400">
        {label}
      </p>
    </div>
  );
}

function getPresenceStatus(
  lastSeenAt:
    | string
    | null
) {
  if (!lastSeenAt) {
    return {
      online:
        false,
      recent:
        false,
      label:
        "Brak danych",
    };
  }

  const timestamp =
    new Date(
      lastSeenAt
    ).getTime();

  const age =
    Date.now() -
    timestamp;

  if (
    age <=
    2 * 60 * 1000
  ) {
    return {
      online:
        true,
      recent:
        true,
      label:
        "Aktywny teraz",
    };
  }

  if (
    age <=
    15 * 60 * 1000
  ) {
    return {
      online:
        false,
      recent:
        true,
      label:
        "Ostatnio aktywny",
    };
  }

  return {
    online:
      false,
    recent:
      false,
    label:
      "Offline",
  };
}

function formatRelativeTime(
  value: string
) {
  const date =
    new Date(
      value
    );

  const difference =
    Date.now() -
    date.getTime();

  if (
    !Number.isFinite(
      difference
    )
  ) {
    return "brak danych";
  }

  const minutes =
    Math.max(
      0,
      Math.floor(
        difference /
          60_000
      )
    );

  if (
    minutes <
    1
  ) {
    return "przed chwilą";
  }

  if (
    minutes <
    60
  ) {
    return `${minutes} min temu`;
  }

  const hours =
    Math.floor(
      minutes /
        60
    );

  if (
    hours <
    24
  ) {
    return `${hours} godz. temu`;
  }

  return formatDateTime(
    value
  );
}

function formatDateTime(
  value: string
) {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Brak danych";
  }

  return date.toLocaleString(
    "pl-PL",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  );
}

function getNewestDate(
  values: string[]
) {
  if (
    values.length ===
    0
  ) {
    return null;
  }

  return values.reduce(
    (
      newest,
      value
    ) =>
      new Date(
        value
      ).getTime() >
      new Date(
        newest
      ).getTime()
        ? value
        : newest
  );
}

function getPageLabel(
  path: string
) {
  if (
    path.startsWith(
      "/admin/nowa-oferta"
    )
  ) {
    return "Dodaje ofertę";
  }

  if (
    path.startsWith(
      "/admin/statystyki"
    )
  ) {
    return "Statystyki";
  }

  if (
    path.startsWith(
      "/admin/zespol"
    )
  ) {
    return "Zespół";
  }

  if (
    path.startsWith(
      "/admin/widocznosc"
    )
  ) {
    return "Widoczność";
  }

  if (
    path.startsWith(
      "/admin/edytuj"
    )
  ) {
    return "Edytuje ofertę";
  }

  return "Panel";
}

function getActivityLabel(
  activity:
    AdminActivityEntry
) {
  if (
    activity.action ===
    "created"
  ) {
    return "Dodano ofertę";
  }

  if (
    activity.action ===
    "deleted"
  ) {
    return "Usunięto ofertę";
  }

  if (
    activity.changedFields.includes(
      "active"
    )
  ) {
    return "Zmieniono widoczność oferty";
  }

  if (
    activity.changedFields.includes(
      "price"
    ) ||
    activity.changedFields.includes(
      "old_price"
    )
  ) {
    return "Zmieniono cenę oferty";
  }

  return "Edytowano ofertę";
}

function ActivityIcon({
  action,
}: {
  action:
    | "created"
    | "updated"
    | "deleted";
}) {
  if (
    action ===
    "created"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M12 5v14" />

        <path d="M5 12h14" />
      </svg>
    );
  }

  if (
    action ===
    "deleted"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M5 12h14" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />

      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}