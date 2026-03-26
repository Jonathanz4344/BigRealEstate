import type { Actions, ActionSide } from "./types";
import { IconButton } from "../buttons";
import { Icon, Icons } from "../icons";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { motion } from "motion/react";
import { stringify } from "../../utils";

type HeaderActionsProps = {
  actions?: (Actions | null)[];
  side: ActionSide;
};

export const HeaderActions = ({ actions = [], side }: HeaderActionsProps) => {
  const leftActions = actions.filter(
    (action) => action && action.side === "left",
  );
  const rightActions = actions.filter(
    (action) => action && action.side === "right",
  );

  const addAmount = Math.max(
    leftActions.length - rightActions.length,
    rightActions.length - leftActions.length,
  );
  const addToLeft = leftActions.length < rightActions.length;

  const [allActions, setAllActions] = useState<(Actions | null)[]>([]);

  useEffect(() => {
    setAllActions(
      actions.concat(
        ((addToLeft && side === "left") || (!addToLeft && side === "right")
          ? (Array(addAmount) as Actions[]).fill({ side, type: "invisible" })
          : []) as (Actions | null)[],
      ),
    );
  }, [addAmount, stringify(actions.map((a) => a && ({ ...a, ref: undefined })))]);

  return allActions.map((action, i) =>
    action && action.side === side ? (
      <motion.div
        key={i}
        ref={action.ref}
        className={clsx(
          "transition-opacity duration-150",
          action.visible === false ? "opacity-0" : "opacity-[100]",
        )}
      >
        {action.type === "iconBtn" && action.iconBtnProps ? (
          <IconButton {...action.iconBtnProps} />
        ) : action.type === "invisible" ? (
          <div key={i} className="opacity-0">
            <IconButton name={Icons.Add} />
          </div>
        ) : (
          action.type === "icon" &&
          action.iconProps && <Icon key={i} {...action.iconProps} />
        )}
      </motion.div>
    ) : null,
  );
};
