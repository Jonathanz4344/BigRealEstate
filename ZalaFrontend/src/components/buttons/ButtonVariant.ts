import { COLORS } from "../../config";

export enum ButtonVariant {
  Primary = "Primary",
  Secondary = "Secondary",
  Tertiary = "Tertiary",
}

export const getButtonBgColor = (variant: ButtonVariant) => {
  switch (variant) {
    case ButtonVariant.Primary:
      return "bg-accent";
    case ButtonVariant.Tertiary:
      return "bg-secondary";
    case ButtonVariant.Secondary:
    default:
      return "bg-white";
  }
};

export const getButtonTextColor = (variant: ButtonVariant) => {
  switch (variant) {
    case ButtonVariant.Primary:
    case ButtonVariant.Tertiary:
      return "text-white";
    case ButtonVariant.Secondary:
    default:
      return "text-secondary";
  }
};

export const getButtonTextColorHex = (variant: ButtonVariant) => {
  switch (variant) {
    case ButtonVariant.Primary:
    case ButtonVariant.Tertiary:
      return COLORS.white;
    case ButtonVariant.Secondary:
    default:
      return COLORS.secondary;
  }
};
