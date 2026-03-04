"use client";

import { useEffect, useState } from "react";

interface Event {
  date: string;
  venue: string;
  city: string;
  ticketLink: string;
}

// TODO: Replace YOUR_SHEET_ID with the actual Google Sheets document ID
const SHEETS_URL =
  "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/gviz/tq?tqx=out:json";

function parseGoogleSheetsResponse(raw: string): Event[] {
  // Strip the Google Visualization API JSONP wrapper
  const jsonString = raw
    .replace(/^[^(]*\(/, "") // remove everything up to first "("
    .replace(/\);?\s*$/, ""); // remove trailing ");" or ")"

  const data = JSON.parse(jsonString);
  const rows: Event[] = [];

  if (!data?.table?.rows) return rows;

  for (const row of data.table.rows) {
    const cells = row.c;
    if (!cells || cells.length < 4) continue;

    // Each cell is { v: value } or null
    const date = cells[0]?.v ?? "";
    const venue = cells[1]?.v ?? "";
    const city = cells[2]?.v ?? "";
    const ticketLink = cells[3]?.v ?? "";

    // Skip header row if the sheet includes it as data
    if (
      typeof date === "string" &&
      date.toLowerCase() === "date"
    )
      continue;

    rows.push({
      date: String(date),
      venue: String(venue),
      city: String(city),
      ticketLink: String(ticketLink),
    });
  }

  return rows;
}

function formatDate(raw: string): { day: string; month: string; year: string } {
  // Try parsing as ISO date string first, then as-is
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return {
      day: d.getDate().toString().padStart(2, "0"),
      month: d.toLocaleString("es-AR", { month: "short" }).toUpperCase(),
      year: d.getFullYear().toString(),
    };
  }
  // Fallback: return raw
  return { day: raw, month: "", year: "" };
}

export default function Dates() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(SHEETS_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.text();
      })
      .then((text) => {
        const parsed = parseGoogleSheetsResponse(text);
        setEvents(parsed);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(true);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <section
      id="dates"
      className="bg-card text-ink py-20 md:py-32 px-6 md:px-12 lg:px-24"
    >
      {/* Section header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-12 md:mb-16 border-b border-ink/10 pb-6">
          <h2 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-ink">
            FECHAS
          </h2>
          <span className="font-body text-xs tracking-[0.3em] uppercase text-ink/30 mb-2">
            Próximos shows
          </span>
        </div>

        {/* States */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-ink/5 animate-pulse rounded-sm"
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="font-body text-ink/40 tracking-wide text-sm">
            No se pudieron cargar las fechas. Intentá de nuevo más tarde.
          </p>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-display text-3xl md:text-4xl text-ink/30 tracking-wide">
              PRÓXIMAMENTE NUEVAS FECHAS
            </p>
            <p className="font-body text-sm text-ink/40 mt-4 tracking-widest uppercase">
              Seguí las redes para novedades
            </p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="flex flex-col divide-y divide-ink/10">
            {events.map((event, idx) => {
              const { day, month, year } = formatDate(event.date);
              return (
                <div
                  key={idx}
                  className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[120px_1fr_auto] items-center gap-6 py-7 hover:bg-ink/[0.03] transition-colors duration-150 -mx-4 px-4 rounded-sm"
                >
                  {/* Date block */}
                  <div className="flex flex-col leading-none min-w-[60px]">
                    <span className="font-display text-[2.5rem] leading-none text-accent">
                      {day}
                    </span>
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-ink/40 mt-1">
                      {month} {year}
                    </span>
                  </div>

                  {/* Venue + city */}
                  <div>
                    <p className="font-display text-xl md:text-2xl tracking-wide leading-tight group-hover:text-accent transition-colors duration-150">
                      {event.venue}
                    </p>
                    <p className="font-body text-sm text-ink/40 mt-1 tracking-wide">
                      {event.city}
                    </p>
                  </div>

                  {/* Ticket link */}
                  {event.ticketLink && event.ticketLink !== "—" ? (
                    <a
                      href={event.ticketLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs font-semibold tracking-[0.2em] uppercase border border-ink/20 px-5 py-3 hover:bg-accent hover:border-accent hover:text-cream transition-all duration-200 whitespace-nowrap"
                    >
                      ENTRADAS
                    </a>
                  ) : (
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-ink/30 px-5 py-3 border border-ink/10">
                      FREE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
