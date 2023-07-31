package utils

import "os"

const BucketName = "Keyring"
const ChainRegistry = "registry.json"

const DbCurrentAccountKey = "current_account"
const DbSettingsNetwork = "settings_network"

const Mainnet = "mainnet"
const Testnet = "testnet"

func DatabasePath() (string, error) {
	dataPath, err := DataPath()
	if err != nil {
		return "", err
	}
	err = os.MkdirAll(dataPath, os.ModePerm)
	if err != nil {
		return "", err
	}
	return dataPath + "/keyring.db", nil
}

func DataPath() (string, error) {
	configPath, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return configPath + "/Keyring", nil
}
