type StatisticCardProps = {
  title: string;
  value: string;
};

export const StatisticCard = ({ title, value }: StatisticCardProps) => {
  return (
    <div className="gradient-background flex flex-row items-center justify-between flex-1 text-center">
      <p className="text-white font-bold text-lg">{title}</p>
      <p className="text-white text-lg">{value}</p>
    </div>
  );
};
