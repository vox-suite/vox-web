"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AppAccount = {
  name: string;
  email: string;
  image: string | null;
  recoveryEnabled: boolean;
};

const AccountContext = createContext<AppAccount | null>(null);

export function AccountProvider({
  account,
  children,
}: {
  account: AppAccount;
  children: ReactNode;
}) {
  return (
    <AccountContext.Provider value={account}>
      {children}
    </AccountContext.Provider>
  );
}

/** The signed-in account resolved by the workspace layout. */
export function useAccount() {
  const account = useContext(AccountContext);
  if (!account)
    throw new Error("useAccount must be used inside the workspace layout");
  return account;
}
