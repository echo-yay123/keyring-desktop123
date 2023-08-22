package services

import (
	"errors"
	"keyring-desktop/utils"

	keycard "github.com/status-im/keycard-go"
	"github.com/status-im/keycard-go/types"
)

// Signing workflow:
//
// keycard-select
// keycard-set-secrets 123456 123456789012 KeycardDefaultPairing
// keycard-pair
//
// keycard-open-secure-channel
// keycard-verify-pin {{ session_pin }}
//
// keycard-derive-key m/1/2/3
// keycard-sign 0000000000000000000000000000000000000000000000000000000000000000
//
// keycard-unpair {{ session_pairing_index }}
func (i *KeyringCard) Sign(
	rawData []byte,
	config *utils.ChainConfig,
	pin string,
	pairingInfo *types.PairingInfo,
) ([]byte, error) {
	utils.Sugar.Info("signing started")
	cmdSet := keycard.NewCommandSet(i.c)

	utils.Sugar.Info("select keycard applet")
	err := cmdSet.Select()
	if err != nil {
		utils.Sugar.Error(err)
		return nil, err
	}

	if !cmdSet.ApplicationInfo.Installed {
		utils.Sugar.Error(errCardNotInstalled)
		return nil, errCardNotInstalled
	}

	if !cmdSet.ApplicationInfo.Initialized {
		utils.Sugar.Error(errCardNotInitialized)
		return nil, errCardNotInitialized
	}

	utils.Sugar.Info("set pairing info")
	cmdSet.PairingInfo = pairingInfo
	if err != nil {
		utils.Sugar.Error(err)
		return nil, err
	}
	if cmdSet.PairingInfo == nil {
		utils.Sugar.Info("cannot open secure channel without setting pairing info")
		return nil, errors.New("failed to pair")
	}

	utils.Sugar.Info("open keycard secure channel")
	if err := cmdSet.OpenSecureChannel(); err != nil {
		utils.Sugar.Error(err)
		return nil, err
	}

	utils.Sugar.Info("verify PIN")
	if err := cmdSet.VerifyPIN(pin); err != nil {
		utils.Sugar.Info("verify PIN failed, error: %s", err)
		return nil, err
	}

	utils.Sugar.Info("derive key")
	if err := cmdSet.DeriveKey(config.Path); err != nil {
		utils.Sugar.Info("derive key failed, error: %s", err)
		return nil, err
	}

	utils.Sugar.Info("sign: %x", rawData)
	sig, err := cmdSet.Sign(rawData)
	if err != nil {
		utils.Sugar.Info("sign failed, error: %s", err)
		return nil, err
	}

	ethSig := append(sig.R(), sig.S()...)
	ethSig = append(ethSig, []byte{sig.V()}...)

	return ethSig, nil
}
