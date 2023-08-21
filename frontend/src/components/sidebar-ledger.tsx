import { ledgerAtom } from "@/store/state";
import { useSetAtom } from "jotai";
import { LucideIcon } from "lucide-react";
import React from "react";

type Props = {
  img?: string;
  icon?: LucideIcon;
  text: string;
  ledger?: string;
};

const SidebarLedger = ({ img, icon, text, ledger }: Props) => {
  const setLedger = useSetAtom(ledgerAtom);

  return (
    <div
      className="
            relative flex items-center justify-center
            h-14 w-14 mt-2 mb-2 mx-auto
            bg-gray-100 hover:bg-primary dark:bg-gray-800
            text-zinc-600 hover:text-white
            hover:rounded-xl rounded-full
            transition-all duration-200 ease-linear
            cursor-pointer shadow-lg
            group
            "
      onClick={() => setLedger((oldLedger) => ledger ? ledger : oldLedger)}
    >
      { icon ? React.createElement(icon) : <img src={img} />}
      <span
        className="
            absolute w-auto p-2 m-2 min-w-max left-16 rounded-md shadow-md
            text-white bg-primary
            text-sm font-bold
            transition-all duration-300 scale-0 origin-left group-hover:scale-100
            "
      >
        {text}
      </span>
    </div>
  );
};

export default SidebarLedger;
