import { MdClose, MdError } from "react-icons/md";

interface AlertProps {
  message: string;
  onClose: () => void;
}

const Alert = ({ message, onClose }: AlertProps) => {
  if (!message) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <span className="block sm:inline">{message}</span>
        <span
          className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
          onClick={onClose}
        >
          <MdClose className="h-6 w-6" />
        </span>
        <MdError className="inline-block mr-2 h-6 w-6" />
      </div>
    </div>
  );
};

export default Alert;
