// Imports Apple's framework for handling low-level operating system tasks like launching subprocesses.
import Foundation

// 'final' prevents other classes from inheriting from this, optimizing compilation and memory layout.
final class ProcessManager {

    // A private, optional variable holding Apple's 'Process' object, which represents the running external program.
    // Starts as 'nil' because no process is running initially.
    private var process: Process?

    // Keeps track of the custom state of our agent. Defaults to '.stopped' (from your AgentStatus enum).
    private var status: AgentStatus = .stopped

    // A private reference to the shared Logger instance for recording system events.
    private let logger = Logger.shared


    // Public function to launch the external Node.js background application.
    func startNode() {

        // If the process is already running, log a debug message and exit early to prevent launching duplicates.
        if isRunning() {
            logger.debug("Node process already running")
            return
        }

        // 'guard' ensures the actual Node binary/executable file exists on the computer disk.
        guard FileManager.default.fileExists(atPath: Constants.nodeExecutable) else {
            // Logs a critical error and typically terminates the app because it cannot proceed.
            logger.fatal("Node executable not found: \(Constants.nodeExecutable)")
        }

        // 'guard' ensures the specific JavaScript script file that Node needs to run exists.
        guard FileManager.default.fileExists(atPath: Constants.nodeScript) else {
            logger.fatal("Node script not found: \(Constants.nodeScript)")
        }

        // Instantiates an Apple 'Process' object, which is used to manage and configure an external command.
        let proc = Process()

        // Tells the process object *which* application binary to run (converted to a file URL).
        proc.executableURL = URL(fileURLWithPath: Constants.nodeExecutable)

        // Passes arguments to the executable (e.g., equivalent to typing 'node script.js' in terminal).
        proc.arguments = [
            Constants.nodeScript
        ]

        // Sets the working directory of the process so it knows where to look for local project files.
        proc.currentDirectoryURL = URL(
            fileURLWithPath: Constants.appDirectory
        )

        // Creates two 'Pipe' objects. Pipes capture the terminal data that standard apps normally print out.
        let stdout = Pipe() // For standard logs/text
        let stderr = Pipe() // For error logs

        // Attaches our custom pipes to the process configuration.
        proc.standardOutput = stdout
        proc.standardError = stderr

        // Attaches an asynchronous listener ('readabilityHandler') to the standard output pipe.
        // Whenever the underlying Node script prints text, this block triggers automatically.
        stdout.fileHandleForReading.readabilityHandler = { handle in
            // Grabs whatever data is currently waiting in the terminal stream buffer.
            let data = handle.availableData

            // If the buffer is empty, do nothing and exit the handler block.
            guard !data.isEmpty else {
                return
            }

            // Converts the raw computer data (bytes) back into a human-readable Swift String using UTF-8 encoding.
            if let text = String(data: data, encoding: .utf8) {
                // Strips empty spaces/newlines from the edges of the text and logs it into our system logs as standard information (.info).
                self.logger.info(text.trimmingCharacters(in: .whitespacesAndNewlines))
            }
        }

        // Attaches an identical asynchronous listener to the standard error pipe.
        stderr.fileHandleForReading.readabilityHandler = { handle in
            let data = handle.availableData

            guard !data.isEmpty else {
                return
            }

            if let text = String(data: data, encoding: .utf8) {
                // If Node crashes or outputs errors, we log them specifically as an error level (.error).
                self.logger.error(text.trimmingCharacters(in: .whitespacesAndNewlines))
            }
        }

        // Attaches a completion handler block that triggers automatically when the external process quits or crashes.
        proc.terminationHandler = { process in

            // Logs the exact exit code the operating system gave when the process closed (0 usually means success, anything else is an error).
            self.logger.warning(
                "Node exited with code \(process.terminationStatus)"
            )

            // Clears the process instance out since it is no longer active.
            self.process = nil
        }

        // 'do-catch' because actually spinning up an external program on an OS can throw errors (e.g., out of memory, permission denied).
        do {

            // Actually commands the operating system to launch the configured subprocess.
            try proc.run()

            // Stores the running process instance into our class variable so we can control it later.
            process = proc

            // Updates our internal enum tracking to state that the system is successfully active.
            status = .running

            // Logs that Node started, printing its unique system-assigned Process ID (PID).
            logger.info("Started Node (PID \(proc.processIdentifier))")

        } catch {

            // Catches any system initialization errors and throws a fatal log.
            logger.fatal("Failed to launch Node: \(error)")
        }
    }

    // Public function to safely shut down the running Node process.
    func stopNode() {

        // Safely unwraps 'self.process'. If no process is active (it's nil), exit early since there's nothing to stop.
        guard let process else {
            return
        }

        // Logs that a shutdown sequence has been initiated.
        logger.info("Stopping Node...")

        // Sends a standard termination signal (SIGTERM) to the program, asking it to close gracefully.
        process.terminate()

        // Freezes this specific Swift background thread until the external Node app fully cleans up and closes completely.
        process.waitUntilExit()

        // Clears out the process variable.
        self.process = nil

        // Updates our state tracker enum to stopped.
        status = .stopped

        // Logs a final confirmation message.
        logger.info("Node stopped")
    }

    // Public function to stop, pause, and safely bring the Node process back up.
    func restartNode() {

        // Updates the status enum to track that we are actively restarting.
        status = .restarting

        // Logs a warning about the manual restart trigger.
        logger.warning("Restarting Node")

        // Calls our method above to kill the existing process cleanly.
        stopNode()

        // Pauses the execution of this Swift thread for a specified amount of time (e.g., 1 or 2 seconds) 
        // to let the OS fully clear ports or resources used by Node.
        Thread.sleep(
            forTimeInterval: Constants.restartDelay
        )

        // Calls our method above to launch a fresh instance of the Node process.
        startNode()
    }

    // A quick helper function that returns true if the process is alive, false otherwise.
    func isRunning() -> Bool {

        // If 'process' is nil, unwrap fails, and guard returns false.
        guard let process else {
            return false
        }

        // Returns Apple's native boolean flag indicating if the system process is active.
        return process.isRunning
    }

    // Public helper function to grab the system's Process Identifier number.
    func currentPid() -> Int32? {

        guard let process else {
            // Returns nil if the process isn't running.
            return nil
        }

        // Returns the actual integer identifier assigned by the operating system.
        return process.processIdentifier
    }

    // Private helper function to calculate the age of the heartbeat file in seconds.
    private func heartbeatAge() -> Int? {

        let path = Constants.heartbeatFile

        // Verifies the heartbeat file exists on disk.
        guard FileManager.default.fileExists(atPath: path)
        else {
            return nil
        }

        do {
            // Reads file metadata properties.
            let attr = try FileManager.default
                .attributesOfItem(atPath: path)

            // Safely casts the modification date attribute as a Swift 'Date'.
            guard let modified =
                attr[.modificationDate] as? Date
            else {
                return nil
            }

            // Calculates seconds between right now and the modification date, converting it into a whole Integer.
            return Int(
                Date().timeIntervalSince(modified)
            )

        } catch {
            // Returns nil if we hit a permission error or cannot read file data.
            return nil
        }
    }

    // Public function that packages all local metrics up into a neat 'AgentState' struct to send to other parts of the app.
    func currentState() -> AgentState {

        // Instantiates and returns an AgentState object using current data variables.
        AgentState(
            status: status,
            pid: currentPid(),
            heartbeatAge: heartbeatAge()
        )
    }
}