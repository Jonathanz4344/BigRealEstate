import type { Icons } from "./IconsEnum";
import { getMaterialIcon } from "./MaterialIcons";
import { COLORS } from "../../config";
import { useHover } from "../../hooks";

export type IconProps = {
  name: Icons;
  color?: string;
  hoverColor?: string;
  size?: number;
  scale?: number;
  hoverScale?: number;
  className?: string;
  onClick?: () => void;
};

export const Icon = ({
  name,
  color: propColor = COLORS.secondary,
  hoverColor = propColor,
  size = 24,
  scale: propScale = 1,
  hoverScale = propScale,
  className,
  onClick,
}: IconProps) => {
  const [isHovered, hoverProps] = useHover();
  const MaterialIcon = getMaterialIcon(name) ?? (() => <></>);

  const scale = isHovered ? hoverScale : propScale;
  const fontSize = size * scale;
  const color = isHovered ? hoverColor : propColor;

  return (
    <MaterialIcon
      onClick={onClick}
      className={className}
      {...hoverProps}
      sx={{ color, fontSize: fontSize }}
    />
  );
};
