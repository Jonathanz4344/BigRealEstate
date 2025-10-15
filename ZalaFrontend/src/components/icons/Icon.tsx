import type { Icons } from "./IconsEnum";
import { getMaterialIcon } from "./MaterialIcons";
import { COLORS } from "../../config";
import { useBoolean } from "../../hooks";

export type IconProps = {
  name: Icons;
  color?: string;
  hoverColor?: string;
  size?: number;
  scale?: number;
  hoverScale?: number;
};

export const Icon = ({
  name,
  color: propColor = COLORS.secondary,
  hoverColor = propColor,
  size = 24,
  scale: propScale = 1,
  hoverScale = propScale,
}: IconProps) => {
  const [isHovered, onHover, onHoverDone] = useBoolean();
  const MaterialIcon = getMaterialIcon(name) ?? (() => <></>);

  const scale = isHovered ? hoverScale : propScale;
  const fontSize = size * scale;
  const color = isHovered ? hoverColor : propColor;

  return (
    <MaterialIcon
      onMouseEnter={onHover}
      onMouseLeave={onHoverDone}
      sx={{ color, fontSize: fontSize }}
    />
  );
};
