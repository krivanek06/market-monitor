export enum AccountTypes {
  Trading = 'Trading',
  Basic = 'Basic',
}

export const actionButtonTooltips = {
  deleteAccount: `Account will be deleted permanently and you will be logged out from the application. This action cannot be undone.`,
  changePassword: `A form will be displayed to you to change your password`,
  resetTransactions: `Use this action to delete your trading history. You will start as a new user with a clean portfolio.`,
  changeDisplayName: `Use this action to change your display name, this name will be visible to other users. Affect takes place in 24h.`,
};

export const accountDescription: { [K in AccountTypes]: string[] } = {
  [AccountTypes.Trading]: [
    `
    With trading account you start with a specific amount of cash on hand.
    You can buy and sell stocks, ETFs, and other securities until you run out of cash.
    Every transaction has some small fess included to it to simulate real life trading.`,
    `As a trader you can also join or create a group and compete with other traders.`,
    `Your profile is public, meaning that other users can find you and see your portfolio and
    as your trading progress is monitored, you will be part of a ranking system,`,
  ],
  [AccountTypes.Basic]: [
    `With basic account you start with a clean portfolio and you can add stocks, ETFs, and other securities to your portfolio.`,
    `This account is intended for users who wants to mirror their real life portfolio and track their progress.`,
    `You can buy assets in the past and the application will calculate your current portfolio value based on the historical data.
    Later we plan to add easier functionalities to mirror your trading portfolio such as uploading a CSV file with your transactions.`,
    `Your profile is private, no one can see your portfolio. You do not participate in any ranking system.`,
  ],
};
