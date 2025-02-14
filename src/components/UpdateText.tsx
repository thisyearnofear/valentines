import { GrRefresh } from "react-icons/gr";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  relativeTime: {
    future: "just now",
    past: "%s ago",
    s: "a few seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

interface UpdateTextProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  currentDateTime: Date;
}

const UpdateText = ({
  lastUpdated,
  onRefresh,
  currentDateTime,
}: UpdateTextProps) => {
  if (!lastUpdated) return null;

  return (
    <div className="flex flex-row items-center gap-2 text-sm">
      <span>Last updated {dayjs(lastUpdated).from(currentDateTime)}</span>
      <button
        onClick={onRefresh}
        className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <GrRefresh className="w-4 h-4" />
      </button>
    </div>
  );
};

export default UpdateText;
