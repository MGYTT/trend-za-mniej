"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import type {
  AdminRole,
} from "@/lib/admin-permissions";

export type AdminActivityMember = {
  userId: string;

  displayName: string;

  role:
    AdminRole;

  totalProducts: number;

  activeProducts: number;

  addedLast7Days: number;

  addedLast30Days: number;

  lastProductAt:
    | string
    | null;

  lastSeenAt:
    | string
    | null;

  lastLoginAt:
    | string
    | null;

  lastLogoutAt:
    | string
    | null;

  sessionStartedAt:
    | string
    | null;

  currentPath:
    | string
    | null;

  loginCount: number;
};

export type AdminActivityEntry = {
  id: number;

  actorId:
    | string
    | null;

  productName: string;

  action:
    | "created"
    | "updated"
    | "deleted";

  changedFields:
    string[];

  createdAt: string;
};

type Props = {
  members:
    AdminActivityMember[];

  recentActivity:
    AdminActivityEntry[];

  canSeeTeam:
    boolean;

  serverNow:
    string;
};

export default function AdminActivityPanel({
  members,
  recentActivity,
  canSeeTeam,
  serverNow,
}: Props) {
  const router =
    useRouter();

  const [
    now,
    setNow,
  ] =
    useState(
      () =>
        new Date(
          serverNow
        ).getTime()
    );

  useEffect(() => {
    const clock =
      window.setInterval(
        () => {
          setNow(
            Date.now()
          );
        },
        30_000
      );

    const refresh =
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
        clock
      );

      window.clearInterval(
        refresh
      );
    };
  }, [
    router,
  ]);

  const onlineCount =
    members.filter(
      (
        member
      ) =>
        getPresenceStatus(
          member.lastSeenAt,
          now
        ).online
    ).length;

  const lastProduct =
    getNewestDate(
      members
        .map(
          (
            member
          ) =>
            member.lastProductAt
        )
        .filter(
          (
            value
          ): value is string =>
            Boolean(
              value
            )
        )
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
          label="Oferty 7 dni"
          value={members.reduce(
            (
              total,
              member
            ) =>
              total +
              member.addedLast7Days,
            0
          )}
          detail="nowo dodane"
        />

        <SummaryCard
          label="Oferty 30 dni"
          value={members.reduce(
            (
              total,
              member
            ) =>
              total +
              member.addedLast30Days,
            0
          )}
          detail="nowo dodane"
        />

        <SummaryCard
          label="Ostatnia oferta"
          value="—"
          detail={
            lastProduct
              ? formatRelativeTime(
                  lastProduct,
                  now
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

          <h2 className="mt-1 text-xl font-black text-stone-900 sm:text-2xl">
            {canSeeTeam
              ? "Aktywność administratorów"
              : "Twoja aktywność"}
          </h2>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6">
            Status jest aktualizowany,
            gdy administrator aktywnie
            korzysta z panelu.
          </p>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {members.map(
            (
              member
            ) => (
              <MemberCard
                key={
                  member.userId
                }
                member={
                  member
                }
                now={
                  now
                }
              />
            )
          )}
        </div>
      </section>

      <section className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-600">
            Historia
          </p>

          <h2 className="mt-1 text-xl font-black text-stone-900 sm:text-2xl">
            Ostatnie działania
          </h2>
        </div>

        {recentActivity.length >
        0 ? (
          <div className="mt-4 divide-y divide-stone-100">
            {recentActivity.map(
              (
                activity
              ) => {
                const actor =
                  members.find(
                    (
                      member
                    ) =>
                      member.userId ===
                      activity.actorId
                  );

                return (
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
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
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

                        <span className="shrink-0 text-[10px] font-semibold text-stone-400 sm:text-xs">
                          {formatRelativeTime(
                            activity.createdAt,
                            now
                          )}
                        </span>
                      </div>

                      <p className="mt-1 text-[10px] text-stone-400 sm:text-xs">
                        {actor
                          ?.displayName ??
                          "Administrator"}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-stone-50 p-4 text-sm text-stone-500">
            Brak zapisanych działań.
          </div>
        )}
      </section>
    </div>
  );
}

function MemberCard({
  member,
  now,
}: {
  member:
    AdminActivityMember;

  now: number;
}) {
  const status =
    getPresenceStatus(
      member.lastSeenAt,
      now
    );

  const sessionDuration =
    status.online &&
    member.sessionStartedAt
      ? formatDuration(
          new Date(
            member.sessionStartedAt
          ).getTime(),
          now
        )
      : null;

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
                status.online
                  ? "bg-emerald-100 text-emerald-800"
                  : status.recent
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-200 text-stone-600",
              ].join(
                " "
              )}
            >
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  status.online
                    ? "bg-emerald-500"
                    : status.recent
                      ? "bg-amber-500"
                      : "bg-stone-400",
                ].join(
                  " "
                )}
              />

              {
                status.label
              }
            </span>

            {member.lastSeenAt && (
              <span className="text-[10px] font-semibold text-stone-400">
                {formatRelativeTime(
                  member.lastSeenAt,
                  now
                )}
              </span>
            )}
          </div>
        </div>

        {status.online &&
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

      <div className="mt-4 grid gap-2 border-t border-stone-200 pt-3 sm:grid-cols-2">
        <InfoRow
          label="Ostatnie logowanie"
          value={
            member.lastLoginAt
              ? formatDateTime(
                  member.lastLoginAt
                )
              : "Brak danych"
          }
        />

        <InfoRow
          label="Liczba logowań"
          value={
            String(
              member.loginCount
            )
          }
        />

        <InfoRow
          label="Ostatnia oferta"
          value={
            member.lastProductAt
              ? formatDateTime(
                  member.lastProductAt
                )
              : "Brak danych"
          }
        />

        <InfoRow
          label={
            status.online
              ? "Bieżąca sesja"
              : "Ostatnie wylogowanie"
          }
          value={
            status.online
              ? sessionDuration
                ? `od ${sessionDuration}`
                : "Aktywna"
              : member.lastLogoutAt
                ? formatDateTime(
                    member.lastLogoutAt
                  )
                : "Brak danych"
          }
        />
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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.07em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-stone-700">
        {value}
      </p>
    </div>
  );
}

function getPresenceStatus(
  lastSeenAt:
    | string
    | null,
  now: number
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
    now -
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
  value: string,
  now: number
) {
  const timestamp =
    new Date(
      value
    ).getTime();

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return "brak danych";
  }

  const difference =
    Math.max(
      0,
      now -
        timestamp
    );

  const minutes =
    Math.floor(
      difference /
        60_000
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

function formatDuration(
  start: number,
  now: number
) {
  const minutes =
    Math.max(
      0,
      Math.floor(
        (
          now -
          start
        ) /
          60_000
      )
    );

  if (
    minutes <
    1
  ) {
    return "mniej niż minutę";
  }

  if (
    minutes <
    60
  ) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes /
        60
    );

  const remainingMinutes =
    minutes %
    60;

  if (
    remainingMinutes ===
    0
  ) {
    return `${hours} godz.`;
  }

  return `${hours} godz. ${remainingMinutes} min`;
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
      current
    ) =>
      new Date(
        current
      ).getTime() >
      new Date(
        newest
      ).getTime()
        ? current
        : newest
  );
}

function getPageLabel(
  path: string
) {
  if (
    path ===
    "/admin/nowa-oferta"
  ) {
    return "Dodaje ofertę";
  }

  if (
    path ===
    "/admin/statystyki"
  ) {
    return "Statystyki";
  }

  if (
    path ===
    "/admin/zespol"
  ) {
    return "Zespół";
  }

  if (
    path ===
    "/admin/widocznosc"
  ) {
    return "Widoczność";
  }

  if (
    path ===
    "/admin/edytuj"
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