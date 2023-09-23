// contextProvider.js
import React, { createContext } from "react";

const ThemeContext = createContext();
const ThemeConsumer = ThemeContext.Consumer;

const ThemeProvider = ({ children, theme }) => {
  const [currentTheme, setCurrentTheme] = React.useState(theme);

  return (
    <ThemeContext.Provider value={currentTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeConsumer, ThemeContext };