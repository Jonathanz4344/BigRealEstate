import type { IFourUpItem } from "../../interfaces";
import { FourUpText } from "./FourUpText";

type FourUpCardProps = {
  title: string;
  items: IFourUpItem[];
};

export const FourUpCard = ({ title, items }: FourUpCardProps) => {
  return (
    <div className="gradient-background flex-1 h-min">
      <h3 className="text-white font-bold text-2xl mb-4">{title}</h3>
      {items.map((item, index) => (
        <FourUpText key={index} item={item} />
      ))}
    </div>
  );
};

// /* Card */

/* Auto layout */
// display: flex;
// flex-direction: column;
// justify-content: center;
// align-items: center;
// padding: 40px;
// gap: 10px;

// position: absolute;
// width: 589px;
// height: 258px;
// left: 111px;
// top: 343px;

// background: linear-gradient(297.16deg, rgba(59, 78, 108, 0.5) 14.21%, rgba(115, 151, 210, 0.25) 87.17%);
// box-shadow: 0px 4px 4px #2E394C;
// backdrop-filter: blur(5px);
// /* Note: backdrop-filter has minimal browser support */
// border-radius: 20px;
