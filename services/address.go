package services

import (
	"keyring-desktop/utils"

	"github.com/ethereum/go-ethereum/crypto"
	keycard "github.com/status-im/keycard-go"
	"github.com/status-im/keycard-go/types"
)

// keycard-select
// keycard-set-secrets 123456 123456789012 KeycardDefaultPairing
// keycard-pair
// keycard-open-secure-channel
// keycard-verify-pin {{ session_pin }}
// keycard-derive-key
// keycard-sign "hello"
// keycard-unpair {{ session_pairing_index }}
func (i *KeyringCard) ChainAddress(pin string, pairingInfo *types.PairingInfo, config *utils.ChainConfig) (string, error) {
	cmdSet := keycard.NewCommandSet(i.c)

	utils.Sugar.Infof("select keycard applet")
	err := cmdSet.Select()
	if err != nil {
		utils.Sugar.Infof("Error: %s", err)
		return "", err
	}

	if !cmdSet.ApplicationInfo.Installed {
		utils.Sugar.Infof("installation is not done, error: %s", errCardNotInstalled)
		return "", errCardNotInstalled
	}

	if !cmdSet.ApplicationInfo.Initialized {
		utils.Sugar.Error(errCardNotInitialized)
		return "", errCardNotInitialized
	}

	utils.Sugar.Info("set pairing info")
	cmdSet.PairingInfo = pairingInfo
	if cmdSet.PairingInfo == nil {
		utils.Sugar.Infof("cannot open secure channel without setting pairing info")
		return "", errNoPairingInfo
	}

	utils.Sugar.Infof("open keycard secure channel")
	if err := cmdSet.OpenSecureChannel(); err != nil {
		utils.Sugar.Infof("open keycard secure channel failed, error: %s", err)
		return "", err
	}

	utils.Sugar.Infof("verify PIN")
	if err := cmdSet.VerifyPIN(pin); err != nil {
		utils.Sugar.Infof("verify PIN failed, error: %s", err)
		return "", err
	}

	utils.Sugar.Infof("derive key")
	if err := cmdSet.DeriveKey(config.Path); err != nil {
		utils.Sugar.Infof("derive key failed, error: %s", err)
		return "", err
	}

	utils.Sugar.Infof("sign hello")
	data := crypto.Keccak256([]byte("hello"))
	sig, err := cmdSet.Sign(data)

	if err != nil {
		utils.Sugar.Infof("sign failed, error: %s", err)
		return "", err
	}
	ecdsaPubKey, err := crypto.UnmarshalPubkey(sig.PubKey())
	if err != nil {
		utils.Sugar.Infof("pub key error: %s", err)
		return "", err
	}

	address := crypto.PubkeyToAddress(*ecdsaPubKey).Hex()

	return address, nil
}
