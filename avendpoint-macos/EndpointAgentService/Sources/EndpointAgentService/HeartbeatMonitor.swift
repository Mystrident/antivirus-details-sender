// Imports Apple's core framework for basic data types, file management, and time tracking.
import Foundation

// 'final' means this class cannot be inherited by another class (subclassed), which optimizes performance.
// A 'class' is a reference type (unlike 'struct', which is a value type).
final class HeartbeatMonitor {

    // A private, constant reference to a 'ProcessManager' object. 
    // 'private' restricts access so it can only be used inside this class.
    private let manager: ProcessManager
    
    // A private, constant reference to a shared logging object for tracking system events.
    private let logger = Logger.shared

    // A private variable to hold a background timer. 
    // The '?' means it starts as 'nil' and will only hold a timer when the monitor is running.
    private var timer: DispatchSourceTimer?

    // The initializer (constructor) that requires a 'ProcessManager' to be passed in when creating this monitor.
    init(manager: ProcessManager) {
        // 'self.manager' refers to the class property, while 'manager' refers to the incoming parameter.
        self.manager = manager
    }

    // A public function that anyone can call to start monitoring the heartbeat.
    func start() {

        // Logs an informational message indicating that the monitor has kicked off.
        logger.info("Heartbeat monitor started")

        // Creates a background timer instance using Grand Central Dispatch (GCD).
        timer = DispatchSource.makeTimerSource()

        // Configures the timer to start immediately (.now()) and repeat at a specific interval.
        // 'Constants.healthCheckInterval' is a configuration defined elsewhere in the project.
        timer?.schedule(
            deadline: .now(),
            repeating: Constants.healthCheckInterval
        )

        // Sets up the block of code (closure) that runs every time the timer fires.
        // '[weak self]' prevents "retain cycles" (memory leaks) by ensuring the timer doesn't forcefully keep this class alive in memory.
        timer?.setEventHandler { [weak self] in
            // Safely calls the health check function if 'self' still exists in memory.
            self?.performHealthCheck()
        }

        // Background timers start in a paused state; this line actually kicks off the timer execution.
        timer?.resume()
    }

    // A public function to stop the monitoring process.
    func stop() {
        // Stops the timer from firing ever again.
        timer?.cancel()
        // Clears out the timer variable by setting it back to 'nil'.
        timer = nil
    }

    // MARK: - Health Check

    // A private helper function that executes the actual logic of checking if the node is healthy.
    private func performHealthCheck() {

        // 'guard' checks if a condition is true. If the manager says the process is NOT running, 
        // it enters the 'else' block immediately.
        guard manager.isRunning() else {

        if manager.wasStoppedManually() {
            return
        }

        logger.warning("Node process not running. Restarting...")

        manager.startNode()

        return
    }

        // 'guard let' tries to safely unwrap the optional value returned by heartbeatAgeSeconds().
        // If it returns 'nil' (file missing), the 'else' block runs.
        guard let heartbeatAge = heartbeatAgeSeconds() else {

            if manager.wasStoppedManually() {
            return
        }

        logger.warning("Heartbeat file missing")

        manager.restartNode()

        return
    }

        // Logs a debug message showing how old the heartbeat file currently is.
        // 'Int(heartbeatAge)' converts a decimal time (Double) into a whole number.
        logger.debug("Heartbeat age: \(Int(heartbeatAge)) seconds")

        // Checks if the heartbeat age has exceeded our allowed threshold.
        if heartbeatAge > Constants.heartbeatTimeout {

        if manager.wasStoppedManually() {
            return
        }

        logger.warning(
            "Heartbeat stale (\(Int(heartbeatAge))s). Restarting Node."
        )

        manager.restartNode()
    }
}

    

    // A private helper function that calculates how many seconds ago the heartbeat file was updated.
    // It returns an optional TimeInterval (which is just a Double), meaning it can return 'nil' if something fails.
    private func heartbeatAgeSeconds() -> TimeInterval? {

        // Retrieves the file path string from our global constants.
        let path = Constants.heartbeatFile

        // Checks if the file actually exists on the disk. If it doesn't, it exits early.
        guard FileManager.default.fileExists(atPath: path) else {
            // Returns nil, meaning "could not determine age".
            return nil
        }

        // 'do-catch' is Swift's way of handling errors that might get thrown during file system operations.
        do {

            // Tries to read the metadata/properties of the file at the given path.
            let attributes = try FileManager.default.attributesOfItem(
                atPath: path
            )

            // Safely extracts the 'modificationDate' attribute and ensures it is indeed a 'Date' object.
            guard let modified =
                attributes[.modificationDate] as? Date
            else {
                // If the modification date property is missing or corrupt, return nil.
                return nil
            }

            // Calculates and returns the mathematical difference (in seconds) between right now and the file's last modification time.
            return Date().timeIntervalSince(modified)

        } catch {
            // If any error occurred inside the 'do' block (e.g., file permissions issue), this block catches it.

            // Logs the error to the system logs.
            logger.error("Unable to read heartbeat timestamp")

            // Returns nil because we couldn't read the file.
            return nil
        }
    }
}