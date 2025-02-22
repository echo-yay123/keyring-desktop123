package main

import (
	"context"
	"encoding/json"
	"errors"
	"keyring-desktop/crosschain"
	"keyring-desktop/crosschain/chain/evm"
	"keyring-desktop/crosschain/factory"
	"keyring-desktop/services"
	"keyring-desktop/utils"
	"math/big"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/signer/core/apitypes"
)

func (a *App) SendTransaction(
	from string,
	to string,
	chainName string,
	value string,
	gas string,
	data string,
	tip string,
	pin string,
	cardId int,
) (crosschain.TxHash, error) {
	utils.Sugar.Infof("Send transaction from %s to %s on %s", from, to, chainName)
	if pin == "" || from == "" || to == "" || chainName == "" {
		return "", errors.New("input can not be empty")
	}

	chainConfig := utils.GetChainConfig(a.chainConfigs, chainName)
	if chainConfig == nil {
		return "", errors.New("chain configuration not found")
	}

	ctx := context.Background()

	assetConfig, err := utils.ConvertAssetConfig(a.chainConfigs, "", chainName)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("unsupported asset")
	}

	fromAddress := crosschain.Address(from)
	toAddress := crosschain.Address(to)

	client, _ := factory.NewClient(assetConfig)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to create a client")
	}

	input, err := client.FetchTxInput(ctx, fromAddress, toAddress)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to fetch tx input")
	}
	if tip != "" {
		input.(*evm.TxInput).GasTipCap = crosschain.NewAmountBlockchainFromStr(tip)
	}

	utils.Sugar.Infof("input: %+v", input)

	// build tx
	builder, err := factory.NewTxBuilder(assetConfig)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to create transaction builder")
	}
	dataBytes, err := hexutil.Decode(data)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to decode payload")
	}
	valueInt := new(big.Int)
	if value != "" {
		valueInt, err = hexutil.DecodeBig(value)
	}
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to decode value")
	}
	gasUint, err := hexutil.DecodeUint64(gas)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to decode gas limit")
	}
	tx, err := builder.NewSendTransaction(fromAddress, toAddress, gasUint, valueInt, dataBytes, input)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to create transaction")
	}
	sighashes, err := tx.Sighashes()
	if err != nil {
		utils.Sugar.Infof("Error: %s", err)
		return "", errors.New("failed to get transaction hash")
	}
	sighash := sighashes[0]
	utils.Sugar.Infof("transaction: %+v", tx)
	utils.Sugar.Infof("signing: %x", sighash)

	// connect to card
	keyringCard, err := services.NewKeyringCard()
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to connect to card")
	}
	defer keyringCard.Release()

	// get pairing info
	pairingInfo, err := a.getPairingInfo(pin, cardId)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to get pairing info")
	}

	signature, err := keyringCard.Sign(sighash, chainConfig, pin, pairingInfo)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to sign transaction hash")
	}
	utils.Sugar.Infof("signature: %x", signature)

	// complete the tx by adding signature
	err = tx.AddSignatures(signature)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to add signature")
	}

	// submit the tx
	txId := tx.Hash()
	utils.Sugar.Infof("Submitting tx id: %s", txId)
	err = client.SubmitTx(ctx, tx)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to submit transaction")
	}

	return txId, nil
}

func (a *App) SignTypedData(
	chainName string,
	data string,
	pin string,
	cardId int,
) (string, error) {
	utils.Sugar.Infof("sign typed data: %s", data)
	if pin == "" || data == "" || chainName == "" {
		return "", errors.New("input can not be empty")
	}

	chainConfig := utils.GetChainConfig(a.chainConfigs, chainName)
	if chainConfig == nil {
		return "", errors.New("chain configuration not found")
	}

	var typedData apitypes.TypedData
	err := json.Unmarshal([]byte(data), &typedData)
	if err != nil {
		return "", errors.New("failed to parse typed data")
	}

	hash, _, err := apitypes.TypedDataAndHash(typedData)
	if err != nil {
		return "", errors.New("failed to hash typed data")
	}

	// connect to card
	keyringCard, err := services.NewKeyringCard()
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to connect to card")
	}
	defer keyringCard.Release()

	// get pairing info
	pairingInfo, err := a.getPairingInfo(pin, cardId)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to get pairing info")
	}

	signature, err := keyringCard.Sign(hash, chainConfig, pin, pairingInfo)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to sign transaction hash")
	}
	utils.Sugar.Infof("signature: %x", signature)

	return hexutil.Encode(signature), nil
}
