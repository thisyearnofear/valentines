export default function Footer() {
  return (
    <div
      data-tour="built-by"
      className="text-xs text-gray-500 dark:text-gray-400"
    >
      Built by{" "}
      <a
        href="https://warpcast.com/udingethe"
        target="_blank"
        rel="noopener noreferrer"
        className="text-pink-500 hover:text-pink-600"
      >
        @udingethe
      </a>{" "}
      •{" "}
      <a
        href="https://gitsplits.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-pink-500 hover:text-pink-600"
      >
        GitSplits
      </a>
    </div>
  );
}
