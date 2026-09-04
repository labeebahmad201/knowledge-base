import React, { createContext, useContext, useState, ReactNode } from 'react';

type Ctx = {
  query: string;
  setQuery: (q: string) => void;
};

const SQLPlaygroundContext = createContext<Ctx>({ query: '', setQuery: () => {} });

export function SQLPlaygroundProvider({ children, initialQuery }: { children: ReactNode; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery ?? "SELECT id, user_id, amount FROM orders WHERE status = 'paid'");
  return (
    <SQLPlaygroundContext.Provider value={{ query, setQuery }}>
      {children}
    </SQLPlaygroundContext.Provider>
  );
}

export function useSQLPlayground() {
  return useContext(SQLPlaygroundContext);
}
