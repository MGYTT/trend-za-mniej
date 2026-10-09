"use client";

import {
  useMemo,
  useState,
} from "react";

type DayStat = {
  day: string;
  clicks: number;
};

type Props = {
  data: DayStat[];
};

function formatDay(
  value: string
) {
  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      day: "2-digit",
      month: "2-digit",
    }
  ).format(
    new Date(
      `${value}T12:00:00`
    )
  );
}

function formatFullDay(
  value: string
) {
  return new Intl.DateTimeFormat(
    "pl-PL",
    {
      weekday:
        "short",

      day:
        "numeric",

      month:
        "long",
    }
  ).format(
    new Date(
      `${value}T12:00:00`
    )
  );
}

export default function ClicksChart({
  data,
}: Props) {
  const initialIndex =
    data.length > 0
      ? data.length - 1
      : 0;

  const [
    selectedIndex,
    setSelectedIndex,
  ] =
    useState(
      initialIndex
    );

  const maxClicks =
    useMemo(
      () =>
        Math.max(
          ...data.map(
            (
              item
            ) =>
              item.clicks
          ),
          1
        ),
      [
        data,
      ]
    );

  const totalClicks =
    useMemo(
      () =>
        data.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.clicks,
          0
        ),
      [
        data,
      ]
    );

  const selected =
    data[
      Math.min(
        selectedIndex,
        Math.max(
          0,
          data.length -
            1
        )
      )
    ];

  if (
    data.length ===
    0
  ) {
    return (
      <div className="flex min-h-52 items-center justify-center rounded-[20px] bg-stone-50 px-6 text-center">
        <div>
          <p className="text-sm font-black text-stone-700">
            Brak danych
          </p>

          <p className="mt-1 text-xs leading-5 text-stone-400">
            Wykres pojawi się,
            gdy zostaną zapisane
            pierwsze kliknięcia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.13em] text-stone-400">
            Wybrany dzień
          </p>

          <p className="mt-1 text-sm font-black capitalize text-stone-900">
            {selected
              ? formatFullDay(
                  selected.day
                )
              : "—"}
          </p>
        </div>

        <div className="rounded-[16px] bg-rose-50 px-4 py-2 text-right">
          <p className="text-xl font-black tracking-[-0.04em] text-rose-600">
            {selected
              ?.clicks ??
              0}
          </p>

          <p className="text-[9px] font-bold text-rose-400">
            kliknięć
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div
          className="grid h-44 items-end gap-[3px] sm:h-52 sm:gap-1.5"
          style={{
            gridTemplateColumns:
              `repeat(${data.length}, minmax(0, 1fr))`,
          }}
        >
          {data.map(
            (
              item,
              index
            ) => {
              const percentage =
                item.clicks ===
                0
                  ? 3
                  : Math.max(
                      8,
                      (
                        item.clicks /
                        maxClicks
                      ) *
                        100
                    );

              const active =
                index ===
                selectedIndex;

              return (
                <button
                  key={
                    item.day
                  }
                  type="button"
                  onClick={() =>
                    setSelectedIndex(
                      index
                    )
                  }
                  aria-label={`${formatFullDay(
                    item.day
                  )}: ${item.clicks} kliknięć`}
                  className="group flex h-full min-w-0 flex-col justify-end"
                >
                  <span
                    className={[
                      "mx-auto w-full max-w-5 rounded-full transition-all sm:max-w-7",
                      active
                        ? "bg-rose-600 shadow-[0_4px_12px_rgba(225,29,72,0.25)]"
                        : item.clicks >
                            0
                          ? "bg-rose-200 group-hover:bg-rose-300"
                          : "bg-stone-200",
                    ].join(
                      " "
                    )}
                    style={{
                      height:
                        `${percentage}%`,
                    }}
                  />
                </button>
              );
            }
          )}
        </div>

        <div
          className="mt-2 grid gap-[3px] sm:gap-1.5"
          style={{
            gridTemplateColumns:
              `repeat(${data.length}, minmax(0, 1fr))`,
          }}
        >
          {data.map(
            (
              item,
              index
            ) => {
              const show =
                data.length <=
                  8 ||
                index ===
                  0 ||
                index ===
                  data.length -
                    1 ||
                index %
                  5 ===
                  0;

              return (
                <div
                  key={
                    item.day
                  }
                  className="min-w-0 text-center"
                >
                  {show && (
                    <span className="text-[7px] font-bold text-stone-400 sm:text-[9px]">
                      {formatDay(
                        item.day
                      )}
                    </span>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-stone-100 pt-4">
        <div className="rounded-[16px] bg-stone-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
            Łącznie
          </p>

          <p className="mt-1 text-lg font-black text-stone-900">
            {totalClicks}
          </p>
        </div>

        <div className="rounded-[16px] bg-stone-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-stone-400">
            Najlepszy dzień
          </p>

          <p className="mt-1 text-lg font-black text-stone-900">
            {maxClicks}
          </p>
        </div>
      </div>
    </div>
  );
}