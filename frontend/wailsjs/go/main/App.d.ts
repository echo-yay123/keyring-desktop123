// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {main} from '../models';
import {utils} from '../models';
import {database} from '../models';
import {crosschain} from '../models';

export function AddAsset(arg1:string,arg2:string,arg3:string):Promise<main.ChainAssets>;

export function AddLedger(arg1:string,arg2:string,arg3:string):Promise<string>;

export function CalculateFee(arg1:string,arg2:string,arg3:string,arg4:string,arg5:string):Promise<main.FeeInfo>;

export function CheckCardConnection():Promise<boolean>;

export function CheckCardInitialized():Promise<boolean>;

export function Connect():Promise<main.AccountInfo>;

export function GetAddressAndAssets(arg1:string,arg2:string):Promise<main.ChainAssets>;

export function GetAllAccounts():Promise<Array<main.AccountInfo>>;

export function GetAssetPrices(arg1:string,arg2:string):Promise<main.ChainAssets>;

export function GetChainConfig(arg1:string):Promise<utils.ChainConfig>;

export function GetChainConfigs():Promise<Array<utils.ChainConfig>>;

export function GetChains(arg1:string):Promise<database.AccountChainInfo>;

export function GetCredentials():Promise<database.AccountCredential>;

export function GetNetwork():Promise<string>;

export function Initialize(arg1:string,arg2:string,arg3:number):Promise<string>;

export function Install():Promise<void>;

export function Pair(arg1:string,arg2:string,arg3:string,arg4:string):Promise<string>;

export function RemoveAsset(arg1:string,arg2:string,arg3:string):Promise<main.ChainAssets>;

export function SetNetwork(arg1:string):Promise<void>;

export function SwitchAccount(arg1:string):Promise<main.AccountInfo>;

export function Transfer(arg1:string,arg2:string,arg3:string,arg4:string,arg5:string,arg6:string,arg7:string,arg8:string):Promise<crosschain.TxHash>;

export function UpdateAccountName(arg1:string,arg2:string):Promise<void>;

export function VerifyAddress(arg1:string,arg2:string,arg3:string):Promise<string>;
