import type { IFourUp } from "../../interfaces";
import { FourUpCard } from "../cards";

type IFourUpSection = {
  fourUp: IFourUp;
};

export const FourUpSection = ({ fourUp }: IFourUpSection) => {
  return (
    <div className="mb-8">
      {/* Title above the 2x2 grid */}
      <div className="text-center mb-6">
        <h2 className="text-white text-3xl font-bold mb-2">4 UP</h2>
        <p className="text-gray-300">{fourUp.dateRange}</p>
      </div>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
        <FourUpCard title="Progress" items={fourUp.progress} />
        <FourUpCard title="Plans" items={fourUp.plans} />
        <FourUpCard title="Needs" items={fourUp.needs} />
        <FourUpCard title="Risks" items={fourUp.risks} />
      </div>
    </div>
  );
};
