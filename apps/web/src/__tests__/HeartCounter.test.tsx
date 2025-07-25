import { render, screen } from "@testing-library/react";
import HeartCounter from "@/components/HeartCounter";

describe("HeartCounter", () => {
  it("renders count", () => {
    render(<HeartCounter counter={42} size={100} onHold={() => {}} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});