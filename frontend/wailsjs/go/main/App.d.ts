// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {database} from '../models';
import {utils} from '../models';
import {crosschain} from '../models';

export function AddLedger(arg1:string,arg2:string):Promise<string>;

export function CheckCardConnection():Promise<boolean>;

export function CheckCardInitialized():Promise<boolean>;

export function Connect():Promise<string>;

export function GetAddressAndAssets(arg1:string,arg2:string):Promise<database.AccountChainAssets>;

export function GetChainConfigs():Promise<Array<utils.ChainConfig>>;

export function GetChains(arg1:string):Promise<database.AccountChainInfo>;

export function Initialize(arg1:string,arg2:string,arg3:number):Promise<string>;

export function Install():Promise<void>;

export function Pair(arg1:string,arg2:string):Promise<string>;

export function Transfer(arg1:string,arg2:string,arg3:string,arg4:string,arg5:string):Promise<crosschain.TxHash>;
