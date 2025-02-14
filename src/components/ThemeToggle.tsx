import { FaMoon, FaSun } from "react-icons/fa";

interface ThemeToggleProps {
  toggleTheme: () => void;
  currentTheme: string;
}

const ThemeToggle = ({ toggleTheme, currentTheme }: ThemeToggleProps) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? (
        <FaSun className="w-5 h-5 text-gray-800 dark:text-white" />
      ) : (
        <FaMoon className="w-5 h-5 text-gray-800 dark:text-white" />
      )}
    </button>
  );
};

export default ThemeToggle;
