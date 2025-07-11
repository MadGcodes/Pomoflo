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

describe("Sound Component Performance", () => {
  it("performs playAmbientSound quickly", () => {
    const mockPlay = jest.fn();
    const mockStop = jest.fn();
    const mockToast = jest.fn();

    jest.mocked(require("@/contexts/PomodoroContext").usePomodoro).mockReturnValue({
      selectedSound: "",
      isPlayingSound: false,
      playAmbientSound: mockPlay,
      stopAmbientSound: mockStop,
    });

    jest.mocked(require("@/hooks/use-toast").useToast).mockReturnValue({
      toast: mockToast,
    });

    // Measure start time
    const startTime = performance.now();

    // Simulate clicking "White Noise"
    fireEvent.click(screen.getByText("White Noise"));

    // Measure end time
    const endTime = performance.now();
    
    // Check if the function executed in less than 100 milliseconds (you can adjust this threshold as needed)
    const executionTime = endTime - startTime;
    console.log(`Time taken for playAmbientSound: ${executionTime}ms`);

    expect(executionTime).toBeLessThan(100);  // Ensure it's under 100ms

    // Ensure the sound was selected and the toast was triggered
    expect(mockPlay).toHaveBeenCalledWith("white");
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sound Selected",
        description: "White Noise will play during your focus sessions.",
      })
    );
  });

  it("performs switching sound quickly", () => {
    const mockPlay = jest.fn();
    const mockStop = jest.fn();
    const mockToast = jest.fn();

    jest.mocked(require("@/contexts/PomodoroContext").usePomodoro).mockReturnValue({
      selectedSound: "white",
      isPlayingSound: true,
      playAmbientSound: mockPlay,
      stopAmbientSound: mockStop,
    });

    jest.mocked(require("@/hooks/use-toast").useToast).mockReturnValue({
      toast: mockToast,
    });

    // Measure start time
    const startTime = performance.now();

    // Simulate clicking "Rain Sound"
    fireEvent.click(screen.getByText("Rain Sound"));

    // Measure end time
    const endTime = performance.now();
    
    // Check if the function executed in less than 100 milliseconds (you can adjust this threshold as needed)
    const executionTime = endTime - startTime;
    console.log(`Time taken for switching sound: ${executionTime}ms`);

    expect(executionTime).toBeLessThan(100);  // Ensure it's under 100ms

    // Ensure previous sound was stopped and new sound was selected
    expect(mockStop).toHaveBeenCalled();
    expect(mockPlay).toHaveBeenCalledWith("rain");
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sound Selected",
        description: "Rain Sound will play during your focus sessions.",
      })
    );
  });
});
