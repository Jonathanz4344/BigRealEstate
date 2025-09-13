import { useEffect, useRef, useState } from "react";
import { Data } from "../../config";
import type { IDayHour } from "../../interfaces";

export const useHoursPage = () => {
  const initRan = useRef(false);
  const weeklyData = Data.hours;

  const [currentPage, setCurrentPage] = useState(0);
  const [dateRanges, setDateRanges] = useState<string[]>([]);
  const [pages, setPages] = useState<IDayHour[][]>([]);
  const [stats, setStats] = useState({ total: 0, avg: 0, weekly: 0 });

  // Update weekly hours stats every page change
  useEffect(() => {
    if (!initRan.current) return;
    setStats((prev) => ({
      ...prev,
      weekly: getTotalDayHours(pages[currentPage] ?? []),
    }));
  }, [currentPage]);

  useEffect(() => {
    init();
  }, []);

  // Initialize state
  const init = () => {
    const pageDateRanges: string[] = [];
    const pagesLocal: IDayHour[][] = [];
    let currentPage: IDayHour[] = [];
    let totalHoursLocal = 0;

    // Sort data by date most recent date first
    const sortedData = [...weeklyData]
      .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
      .reverse();

    // Total hours and separate data into pages of dates Sun - Sat
    for (const day of sortedData) {
      totalHoursLocal += getTotalDayHour(day);
      currentPage.push(day);

      if (parseDate(day.date).getDay() === 0) {
        pagesLocal.push(currentPage);
        currentPage = [];
      }
    }

    // Add any left over dates on the last page
    if (currentPage.length > 0) pagesLocal.push(currentPage);

    // Create string of date ranges based on page
    for (const page of pagesLocal) {
      const parsedStart = parseDate(page[page.length - 1].date);
      const addTillEnd = 6 - parsedStart.getDay();
      const subTillStart = parsedStart.getDay();

      const start = new Date(parsedStart.getTime());
      const end = new Date(parsedStart.getTime());

      start.setDate(parsedStart.getDate() - subTillStart);
      end.setDate(parsedStart.getDate() + addTillEnd);

      pageDateRanges.push(getDateRangeString(start, end));
    }

    // Set state
    setCurrentPage(0);
    setPages(pagesLocal);
    setDateRanges(pageDateRanges);
    setStats({
      total: totalHoursLocal,
      avg: totalHoursLocal / sortedData.length,
      weekly: getTotalDayHours(pagesLocal[0]),
    });

    initRan.current = true;
  };

  // Format range btwn dates x and y
  const getDateRangeString = (x: Date, y: Date) =>
    `${x.toLocaleDateString()}-${y.toLocaleDateString()}`;

  // Totaling hours recorded for day(s)
  const getTotalDayHours = (days: IDayHour[]) =>
    days.reduce((curr, next) => curr + getTotalDayHour(next), 0);
  const getTotalDayHour = (day: IDayHour) =>
    Object.values(day.hours).reduce((curr, nxt) => curr + nxt, 0);

  // Navigate between pages
  const nextPage = () =>
    setCurrentPage((prev) => (prev === pages.length - 1 ? prev : prev + 1));
  const lastPage = () =>
    setCurrentPage((prev) => (prev === 0 ? prev : prev - 1));

  // Helper function to parse date for comparison
  const parseDate = (dateStr: string) => {
    const [month, day, year] = dateStr.split("/");
    return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  return {
    pages,
    totalPages: pages.length,
    dateRanges,
    currentPage,
    stats,

    nextPage,
    lastPage,
  };
};
