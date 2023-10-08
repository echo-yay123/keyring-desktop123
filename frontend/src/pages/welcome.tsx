import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  accountAtom,
  chainConfigsAtom,
  ledgerAtom,
  showNewLedgerAtom,
  showSidebarItem,
} from "@/store/state";
import { useAtom, useAtomValue } from "jotai";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AddLedger, GetChains } from "@/../wailsjs/go/main/App";
import Accounts from "./accounts";
import Wallet from "./wallet";
import Settings from "./settings";

function WelcomePage() {
  const [chains, setChains] = useState<string[]>([]);
  const [ledgerCandidate, setLedgerCandidate] = useState("");
  const [pin, setPin] = useState("");

  const [showNewLedger, setShowNewLedger] = useAtom(showNewLedgerAtom);
  const [ledger, setLedger] = useAtom(ledgerAtom);
  const account = useAtomValue(accountAtom);
  const chainConfigs = useAtomValue(chainConfigsAtom);
  const sidebarItem = useAtomValue(showSidebarItem);

  const { toast } = useToast();

  // get chains of the account
  useEffect(() => {
    GetChains(account.id)
      .then((chains) => {
        setLedger(chains.lastSelectedChain);
        setChains(chains.chains);
      })
      .catch((err) => {
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      });
  }, [account]);

  const addLedger = async () => {
    try {
      let _ = await AddLedger(account.id, ledgerCandidate, pin);
      let chains = await GetChains(account.id);
      setChains(chains.chains);
      setLedger(chains.lastSelectedChain);
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
    setShowNewLedger(false);
  };

  const newLedgerDialog = () => {
    return (
      <Dialog open={true} onOpenChange={setShowNewLedger}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add a New Blockchain</DialogTitle>
            <DialogDescription>
              Choose one from the below list.
            </DialogDescription>
          </DialogHeader>
          <div className="ml-20 flex flex-col gap-2">
            <Select onValueChange={setLedgerCandidate}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a blockchain" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {chainConfigs.map((chainConfig) => {
                    return (
                      !chainConfig.disable && (
                        <SelectItem value={chainConfig.name}>
                          {chainConfig.name}
                        </SelectItem>
                      )
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div>
              <Label>PIN</Label>
              <Input
                type="password"
                onChange={(event) => setPin(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={addLedger}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const mainScreen = () => {
    switch (sidebarItem) {
      case "settings":
        return <Settings />;
      case "accounts":
        return <Accounts />;
      default:
        return chains.length === 0 ? <Guide /> : <Wallet />
    }
  }

  return (
    <div className="flex flex-row">
      {showNewLedger && newLedgerDialog()}
      <Sidebar chains={chains} lastSelectedChain={ledger} />
      {mainScreen()}
    </div>
  );
}

const Guide = () => {
  return (
    <div className="flex flex-col justify-center grow gap-8">
      <h1 className="text-5xl text-center">Welcome</h1>
      <h1 className="text-2xl text-center">
        Click the <Plus className="inline bg-gray-300 rounded-full m-2" />{" "}
        button on left to start!
      </h1>
    </div>
  );
};

export default WelcomePage;
