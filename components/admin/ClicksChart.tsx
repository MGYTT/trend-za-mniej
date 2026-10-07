type DayStat = {
  day: string;
  clicks: number;
};

type Props = {
  data: DayStat[];
};

function formatDay(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
  }).format(
    new Date(`${value}T12:00:00`)
  );
}

export default function ClicksChart({
  data,
}: Props) {
  const maxClicks = Math.max(
    ...data.map((item) => item.clicks),
    1
  );

  const totalClicks = data.reduce(
    (sum, item) => sum + item.clicks,
    0
  );

  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-600">
            📈 Ruch
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Kliknięcia w czasie
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            Kliknięcia prowadzące z Twojej strony
            do ofert afiliacyjnych.
          </p>
        </div>

        <div className="rounded-2xl bg-rose-50 px-5 py-3">
          <p className="text-xs font-semibold text-stone-500">
            Łącznie
          </p>

          <p className="text-2xl font-black text-rose-600">
            {totalClicks}
          </p>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto">
        <div
          className="flex min-w-[650px] items-end gap-2"
          style={{
            height: "260px",
          }}
        >
          {data.map((item) => {
            const height =
              item.clicks === 0
                ? 4
                : Math.max(
                    (item.clicks / maxClicks) *
                      210,
                    12
                  );

            return (
              <div
                key={item.day}
                className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
              >
                <div className="mb-2 text-xs font-bold text-stone-600 opacity-0 transition group-hover:opacity-100">
                  {item.clicks}
                </div>

                <div
                  className="w-full max-w-8 rounded-t-xl bg-gradient-to-t from-rose-500 to-pink-400 transition hover:from-rose-600 hover:to-pink-500"
                  style={{
                    height: `${height}px`,
                  }}
                />

                <p className="mt-3 text-[10px] text-stone-400">
                  {formatDay(item.day)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}