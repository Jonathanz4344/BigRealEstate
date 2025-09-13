import { ChevronLeft, ChevronRight } from "lucide-react";
import { HourRow, StatisticCard } from "../../components";
import { AssigneeKeys } from "../../interfaces";
import clsx from "clsx";
import { useHoursPage } from "../../hooks";

const Hours = () => {
  const {
    pages,
    totalPages,
    currentPage,
    stats,
    dateRanges,

    nextPage,
    lastPage,
  } = useHoursPage();

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Team Hours</h1>
          <p className="text-slate-300 text-lg">{dateRanges[currentPage]}</p>
        </div>

        {/* Statistics Cards */}
        <div className="flex justify-center gap-6 mb-8">
          <StatisticCard title="Avg. Hours:" value={stats.avg.toString()} />
          <StatisticCard title="Total Hours:" value={stats.total.toString()} />
          <StatisticCard
            title="Weekly Hours:"
            value={stats.weekly.toString()}
          />
        </div>

        {/* Data Rows */}
        <div className="flex flex-col gap-y-4 mb-8">
          <HourRow
            isHeader
            slots={["Date", ...AssigneeKeys]}
            noCenterIndexs={[0]}
          />
          {(pages[currentPage] ?? []).map((week, index) => (
            <HourRow
              key={index}
              slots={[
                week.date,
                ...Object.values(week.hours).map((hour) => hour.toString()),
              ]}
              noCenterIndexs={[0]}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-row items-center justify-end">
            <div className="gradient-background p-0! flex flex-[.25] flex-row items-center justify-between">
              <div className="p-2">
                <div
                  onClick={lastPage}
                  className={clsx(
                    "rounded-md p-2 cursor-pointer",
                    currentPage !== 0 && "hover:bg-[#ffffff50]",
                    currentPage === 0 && "opacity-50 pointer-events-none"
                  )}
                >
                  <ChevronLeft size={20} />
                </div>
              </div>
              <span className="text-white text-sm">
                {currentPage + 1} of {totalPages}
              </span>
              <div className="p-2">
                <div
                  onClick={nextPage}
                  className={clsx(
                    "rounded-md p-2 cursor-pointer",
                    currentPage !== totalPages - 1 && "hover:bg-[#ffffff50]",
                    currentPage === totalPages - 1 &&
                      "opacity-50 pointer-events-none"
                  )}
                >
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { Hours };
