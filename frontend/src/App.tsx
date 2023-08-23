import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Connect } from "../wailsjs/go/main/App";
import ConnectPage from "./pages/connect";
import WelcomePage from "./pages/welcome";
import { accountAtom } from "./store/state";

function App() {
  const [account, setAccount] = useAtom(accountAtom);

  const { toast } = useToast();

  useEffect(() => {
    Connect()
      .then((res) => setAccount(res))
      .catch((err) => {
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      });
  }, []);

  return (
    <div>
      {!account.id && <ConnectPage />}
      {account.id && <WelcomePage />}
      <Toaster />
    </div>
  );
}

export default App;
