import { main, utils } from "@/../wailsjs/go/models";
import Asset from "@/components/asset";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { useClipboard } from "@/hooks/useClipboard";
import { cn, shortenAddress } from "@/lib/utils";
import {
  accountAtom,
  isTestnetAtom,
  ledgerAtom,
  refreshAtom,
} from "@/store/state";
import { useAtomValue } from "jotai";
import {
  Check,
  ChevronsUpDown,
  Clipboard,
  ClipboardCheck,
  Loader2,
  RotateCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  AddAsset,
  GetAddressAndAssets,
  GetAssetPrices,
  GetChainConfig,
} from "../../wailsjs/go/main/App";
import WalletConnect from "@/components/WalletConnect";

type SelectToken = {
  value: string;
  symbol: string;
  contract: string;
};

function Wallet() {
  const [chainConfig, setChainConfig] = useState<utils.ChainConfig>();
  const [openSelectAssets, setOpenSelectAssets] = useState(false);
  const [selectToken, setSelectToken] = useState<SelectToken | undefined>(
    undefined
  );
  const [loadingAddAsset, setLoadingAddAsset] = useState(false);
  const [getBalanceErr, setGetBalanceErr] = useState(false);
  const [chainAssets, setChainAssets] = useState<main.ChainAssets>();

  const ledger = useAtomValue(ledgerAtom);
  const account = useAtomValue(accountAtom);
  const isTestnet = useAtomValue(isTestnetAtom);
  const refresh = useAtomValue(refreshAtom);

  const { toast } = useToast();

  const { hasCopied, onCopy } = useClipboard();

  // get the address for a specific chain
  useEffect(() => {
    const fn = async () => {
      if (account.id && ledger) {
        try {
          let assets = await GetAddressAndAssets(account.id, ledger);
          setChainAssets(assets);
          if (!assets.address) {
            toast({
              description: `You are ready to add a new blockchain`,
            });
          }

          let prices = await GetAssetPrices(account.id, ledger);
          setChainAssets(prices);
        } catch (err) {
          setGetBalanceErr(true);
          toast({
            title: "Uh oh! Something went wrong.",
            description: `Error happens: ${err}`,
          });
        }
      }
    };

    fn();
  }, [account, ledger, isTestnet]);

  useEffect(() => {
    GetChainConfig(ledger)
      .then((res) => {
        setChainConfig(res);
      })
      .catch((err) => {
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      });
  }, [ledger]);

  useEffect(() => {
    if (hasCopied) {
      toast({ description: "Copied to clipboard!" });
    }
  }, [hasCopied]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "r" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.location.reload();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (refresh) {
      window.location.reload();
    }
  }, [refresh]);

  const addAsset = async () => {
    try {
      setLoadingAddAsset(true);
      let res = await AddAsset(
        account.id,
        ledger,
        chainAssets!.address,
        selectToken!.symbol,
        selectToken!.contract
      );
      setLoadingAddAsset(false);
      setChainAssets(res);
      setSelectToken(undefined);
    } catch (err) {
      setGetBalanceErr(true);
      setLoadingAddAsset(false);
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const showAssetValue = () => {
    if (!chainAssets) return 0;

    const tokensValue = chainAssets.assets.reduce(
      (temp, asset) =>
        temp + parseFloat(asset.balance || "0") * (asset.price || 0),
      0
    );
    const nativeValue =
      parseFloat(chainAssets.balance || "0") * (chainAssets.price || 0);

    const total = tokensValue + nativeValue;

    return parseFloat(total.toFixed(2));
  };

  return (
    <div className="flex flex-col mt-20 gap-20 flex-grow items-center">
      <Tabs defaultValue="assets" className="w-[400px]">
        <TabsList className="grid w-full h-auto p-1 grid-cols-2 bg-gray-200 rounded-lg">
          <TabsTrigger className="text-lg rounded-lg" value="assets">
            Assets
          </TabsTrigger>
          <TabsTrigger className="text-lg rounded-lg" value="transactions">
            Transactions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="assets">
          <div className="mt-6 flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <div className="flex flex-row items-center gap-3">
                <Label className="text-lg">Total</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <RotateCw
                        className="h-5"
                        onClick={() => window.location.reload()}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to refresh</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Label className="text-lg">${showAssetValue()}</Label>
            </div>

            <Accordion type="single" collapsible>
              {chainAssets && (
                <Asset
                  symbol={chainAssets?.symbol}
                  balance={chainAssets.balance}
                  address={chainAssets.address}
                  onError={getBalanceErr}
                />
              )}
              {chainAssets?.assets.map((userAsset) => {
                return (
                  <Asset
                    symbol={userAsset.symbol}
                    balance={userAsset.balance}
                    address={chainAssets.address}
                    contract={userAsset.contractAddress}
                    onError={getBalanceErr}
                  />
                );
              })}
            </Accordion>

            <div className="mt-6 flex flex-row justify-center gap-3">
              <Popover
                open={openSelectAssets}
                onOpenChange={setOpenSelectAssets}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSelectAssets}
                    className="w-[200px] justify-between text-md"
                  >
                    {selectToken ? selectToken.symbol : "Select a token..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search token..." />
                    <CommandEmpty>No token found.</CommandEmpty>
                    <CommandGroup className="overflow-auto max-h-56">
                      {chainConfig?.tokens?.map((token) => (
                        <CommandItem
                          key={token.symbol}
                          onSelect={(currentValue) => {
                            if (
                              selectToken &&
                              selectToken.value === currentValue
                            ) {
                              setSelectToken(undefined);
                            } else {
                              setSelectToken({
                                value: currentValue,
                                symbol: token.symbol,
                                contract: token.contract,
                              });
                            }
                            setOpenSelectAssets(false);
                          }}
                        >
                          <div className="flex flex-row items-center gap-12">
                            <div className="flex flex-row items-center">
                              <img
                                className="w-6 mr-2 rounded-full"
                                src={`/tokens/${token.symbol}_logo.png`}
                              />
                              <Label>{token.symbol}</Label>
                            </div>
                            <Check
                              className={cn(
                                "h-5 w-5",
                                selectToken?.symbol === token.symbol
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {loadingAddAsset ? (
                <Button className="text-md" disabled>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button className="text-md" onClick={addAsset}>
                  Add Asset
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="transactions">
          <Label className="text-lg">Transaction History</Label>
        </TabsContent>
      </Tabs>

      <div className="absolute right-16 top-6 flex flex-row gap-2 items-center">
        <Label className="text-sm underline font-bold">{ledger}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onCopy(chainAssets!.address)}
                className="rounded-3xl"
              >
                <Label className="mr-2">
                  {shortenAddress(chainAssets ? chainAssets.address : "")}
                </Label>
                {hasCopied ? <ClipboardCheck /> : <Clipboard />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to copy address</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {chainAssets?.address && (
        <div className="absolute right-10 bottom-10">
          <WalletConnect address={chainAssets.address} ledger={ledger} cardId={account.id} />
        </div>
      )}
    </div>
  );
}

export default Wallet;
