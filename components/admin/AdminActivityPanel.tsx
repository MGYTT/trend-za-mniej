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

  useEffect(
    () => {
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
    },
    [
      router,
    ]
  );

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

  const added7 =
    members.reduce(
      (
        total,
        member
      ) =>
        total +
        member.addedLast7Days,
      0
    );

  const added30 =
    members.reduce(
      (
        total,
        member
      ) =>
        total +
        member.addedLast30Days,
      0
    );

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon="people"
          label={
            canSeeTeam
              ? "Zespół"
              : "Konto"
          }
          value={
            members.length
          }
          detail={
            canSeeTeam
              ? `${onlineCount} aktywnych`
              : onlineCount >
                  0
                ? "Aktywny teraz"
                : "Offline"
          }
        />

        <SummaryCard
          icon="week"
          label="7 dni"
          value={
            added7
          }
          detail="nowych ofert"
        />

        <SummaryCard
          icon="month"
          label="30 dni"
          value={
            added30
          }
          detail="nowych ofert"
        />

        <SummaryCard
          icon="recent"
          label="Ostatnia"
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

      <section className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                Online
              </p>

              <h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-stone-900 sm:text-2xl">
                {canSeeTeam
                  ? "Aktywność zespołu"
                  : "Twoja aktywność"}
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-400">
                Status odświeża się
                automatycznie podczas
                korzystania z panelu.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-black text-emerald-700">
                {
                  onlineCount
                }{" "}
                online
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-2">
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

      <section className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
            Historia
          </p>

          <h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-stone-900 sm:text-2xl">
            Ostatnie działania
          </h2>
        </div>

        {recentActivity.length >
        0 ? (
          <div className="divide-y divide-stone-100 px-4">
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
                    className="flex gap-3 py-4"
                  >
                    <div
                      className={[
                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]",
                        activity.action ===
                        "created"
                          ? "bg-emerald-50 text-emerald-600"
                          : activity.action ===
                              "deleted"
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600",
                      ].join(
                        " "
                      )}
                    >
                      <ActivityIcon
                        action={
                          activity.action
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-stone-800">
                            {getActivityLabel(
                              activity
                            )}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">
                            {
                              activity.productName
                            }
                          </p>
                        </div>

                        <span className="shrink-0 text-[9px] font-semibold text-stone-400 sm:text-xs">
                          {formatRelativeTime(
                            activity.createdAt,
                            now
                          )}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 text-[8px] font-black text-stone-500">
                          {(
                            actor
                              ?.displayName ??
                            "A"
                          )
                            .slice(
                              0,
                              1
                            )
                            .toUpperCase()}
                        </span>

                        <p className="text-[10px] font-bold text-stone-400">
                          {actor
                            ?.displayName ??
                            "Administrator"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm font-black text-stone-700">
              Brak działań
            </p>

            <p className="mt-1 text-xs text-stone-400">
              Historia pojawi się
              po zmianach w katalogu.
            </p>
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

  now:
    number;
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
    <article className="rounded-[20px] border border-stone-200 bg-[#f8f8f9] p-4">
      <div className="flex items-start gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-stone-950 text-sm font-black text-white">
          {member.displayName
            .slice(
              0,
              1
            )
            .toUpperCase()}

          <span
            className={[
              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#f8f8f9]",
              status.online
                ? "bg-emerald-500"
                : status.recent
                  ? "bg-amber-500"
                  : "bg-stone-300",
            ].join(
              " "
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-stone-900">
                {
                  member.displayName
                }
              </h3>

              <p className="mt-1 text-[10px] font-bold text-stone-400">
                {member.role ===
                "owner"
                  ? "👑 Właściciel"
                  : "Administrator"}
              </p>
            </div>

            <span
              className={[
                "shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black",
                status.online
                  ? "bg-emerald-100 text-emerald-800"
                  : status.recent
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-200 text-stone-500",
              ].join(
                " "
              )}
            >
              {
                status.label
              }
            </span>
          </div>

          {status.online &&
            member.currentPath && (
            <p className="mt-2 text-[10px] font-black text-rose-600">
              {getPageLabel(
                member.currentPath
              )}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1.5">
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

      <details className="mt-3 overflow-hidden rounded-[14px] border border-stone-200 bg-white">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-[10px] font-black text-stone-500">
          Szczegóły aktywności

          <span className="text-base text-stone-300">
            ›
          </span>
        </summary>

        <div className="grid gap-2 border-t border-stone-100 p-2 sm:grid-cols-2">
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
      </details>
    </article>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
  compact = false,
}: {
  icon:
    | "people"
    | "week"
    | "month"
    | "recent";

  label:
    string;

  value:
    | number
    | string;

  detail:
    string;

  compact?:
    boolean;
}) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-stone-100 text-stone-600">
          <SummaryIcon
            type={
              icon
            }
          />
        </span>

        {!compact && (
          <p className="text-2xl font-black tracking-[-0.05em] text-stone-950">
            {value}
          </p>
        )}
      </div>

      <p className="mt-3 text-xs font-black text-stone-700">
        {label}
      </p>

      <p
        className={[
          "mt-1 font-semibold",
          compact
            ? "text-xs text-stone-700"
            : "text-[10px] text-stone-400",
        ].join(
          " "
        )}
      >
        {detail}
      </p>
    </div>
  );
}

function SummaryIcon({
  type,
}: {
  type:
    | "people"
    | "week"
    | "month"
    | "recent";
}) {
  if (
    type ===
    "people"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle
          cx="9"
          cy="8"
          r="3"
        />

        <path d="M3 20a6 6 0 0 1 12 0" />

        <circle
          cx="17"
          cy="9"
          r="2"
        />
      </svg>
    );
  }

  if (
    type ===
    "recent"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
        />

        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function MiniStat({
  value,
  label,
}: {
  value:
    number;

  label:
    string;
}) {
  return (
    <div className="rounded-[12px] bg-white px-2 py-2.5 text-center">
      <p className="text-base font-black tracking-[-0.03em] text-stone-900">
        {value}
      </p>

      <p className="mt-0.5 truncate text-[7px] font-black uppercase tracking-[0.04em] text-stone-400 sm:text-[9px]">
        {label}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-xl bg-stone-50 p-3">
      <p className="text-[8px] font-black uppercase tracking-[0.07em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 text-[11px] font-bold leading-4 text-stone-700">
        {value}
      </p>
    </div>
  );
}

function getPresenceStatus(
  lastSeenAt:
    | string
    | null,
  now:
    number
) {
  if (
    !lastSeenAt
  ) {
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
    2 *
      60 *
      1000
  ) {
    return {
      online:
        true,

      recent:
        true,

      label:
        "Online",
    };
  }

  if (
    age <=
    15 *
      60 *
      1000
  ) {
    return {
      online:
        false,

      recent:
        true,

      label:
        "Niedawno",
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
  value:
    string,
  now:
    number
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
  value:
    string
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
  start:
    number,
  now:
    number
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
  values:
    string[]
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
  path:
    string
) {
  if (
    path ===
    "/admin/nowa-oferta"
  ) {
    return "Dodaje ofertę";
  }

  if (
    path.startsWith(
      "/admin/social"
    )
  ) {
    return "Social Media";
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
    return "Zmieniono widoczność";
  }

  if (
    activity.changedFields.includes(
      "price"
    ) ||
    activity.changedFields.includes(
      "old_price"
    )
  ) {
    return "Zmieniono cenę";
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