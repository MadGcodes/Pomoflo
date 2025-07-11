import { screen, fireEvent } from "@testing-library/react";

// Mock hooks and dependencies
jest.mock("@/contexts/PomodoroContext", () => ({
  usePomodoro: () => ({
    selectedSound: "",
    isPlayingSound: false,
    playAmbientSound: jest.fn(),
    stopAmbientSound: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("Sound Component", () => {
  it("selects a sound and shows a toast", () => {
    const mockPlay = jest.fn();
    const mockToast = jest.fn();
    const mockStop = jest.fn();

    jest.mocked(require("@/contexts/PomodoroContext").usePomodoro).mockReturnValue({
      selectedSound: "",
      isPlayingSound: false,
      playAmbientSound: mockPlay,
      stopAmbientSound: mockStop,
    });

    jest.mocked(require("@/hooks/use-toast").useToast).mockReturnValue({
      toast: mockToast,
    });

    // Simulate clicking "White Noise"
    fireEvent.click(screen.getByText("White Noise"));

    // Ensure the sound was selected
    expect(mockPlay).toHaveBeenCalledWith("white");

    // Ensure toast was triggered
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sound Selected",
        description: "White Noise will play during your focus sessions.",
      })
    );
  });

  it("stops the previous sound when a new sound is selected", () => {
    const mockPlay = jest.fn();
    const mockToast = jest.fn();
    const mockStop = jest.fn();

    jest.mocked(require("@/contexts/PomodoroContext").usePomodoro).mockReturnValue({
      selectedSound: "white", // Assuming it was previously set to white noise
      isPlayingSound: true,
      playAmbientSound: mockPlay,
      stopAmbientSound: mockStop,
    });

    jest.mocked(require("@/hooks/use-toast").useToast).mockReturnValue({
      toast: mockToast,
    });

    // Simulate clicking "Rain Sound"
    fireEvent.click(screen.getByText("Rain Sound"));

    // Ensure the previous sound was stopped
    expect(mockStop).toHaveBeenCalled();

    // Ensure the new sound was selected
    expect(mockPlay).toHaveBeenCalledWith("rain");

    // Ensure toast was triggered for the new sound
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sound Selected",
        description: "Rain Sound will play during your focus sessions.",
      })
    );
  });
});
