package main

import (
	"errors"
	"keyring-desktop/database"
	"keyring-desktop/utils"
)

func (a *App) UpdateAccountName(id int, name string) error {
	return database.UpdateCardName(a.sqlite, id, name)
}

// check if there is card paired already
func (a *App) CurrentAccount() (*CardInfo, error) {
	utils.Sugar.Info("Check if there is smart card paired")

	card, err := database.QueryCurrentCard(a.sqlite)
	if err != nil {
		utils.Sugar.Error(err)
		return nil, errors.New("failed to query current card")
	}

	return a.cardInfo(card), nil
}

func (a *App) GetAllAccounts() ([]CardInfo, error) {
	cards, err := database.QueryAllCards(a.sqlite)
	if err != nil {
		utils.Sugar.Error(err)
		return nil, errors.New("failed to query all cards")
	}

	var res []CardInfo
	for _, card := range cards {
		info := a.cardInfo(&card)
		res = append(res, *info)
	}

	return res, nil
}

func (a *App) SwitchAccount(cardId int) (*CardInfo, error) {
	utils.Sugar.Infof("Switch account to: %v", cardId)

	err := database.UpdateCurrentCard(a.sqlite, cardId)
	if err != nil {
		utils.Sugar.Error(err)
		return nil, errors.New("failed to switch account")
	}

	card, err := database.QueryCurrentCard(a.sqlite)
	if err != nil {
		utils.Sugar.Error(err)
		return nil, errors.New("failed to query current card")
	}

	return a.cardInfo(card), nil
}

func (a *App) cardInfo(card *database.Card) *CardInfo {
	info := CardInfo{
		Id:   card.Id,
		Name: card.Name,
	}

	return &info
}
