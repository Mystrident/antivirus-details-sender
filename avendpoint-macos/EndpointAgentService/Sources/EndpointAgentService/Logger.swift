
import Foundation


enum LogLevel: String {
    
    case debug = "DEBUG"
    case info = "INFO"
    case warning = "WARN"
    case error = "ERROR"
    case fatal = "FATAL"
}

// 'final' guarantees no other class can subclass this Logger, optimizing compilation.
final class Logger {

    // The Singleton instance!(SINGLETON DESIGN PATTERN) This creates the single, shared layout used app-wide.
    static let shared = Logger()

    // A private instance of Apple's DateFormatter, used to turn timestamps into readable text.
    private let formatter: DateFormatter

    // A private initializer. Because it is marked 'private', no other file can call `Logger()`.
    // This forces the entire app to strictly use `Logger.shared`.
    private init() {
        
        formatter = DateFormatter()
        
        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        // Uses a specialized standard locale ('en_US_POSIX') to ensure the time format 
        // remains perfectly identical regardless of the user's iPhone/Mac regional settings.
        formatter.locale = Locale(identifier: "en_US_POSIX")
    }

    // A master private helper function that formats and prints the final string to the console.
    // It takes the log level severity and the text message as parameters.
    private func log(_ level: LogLevel, _ message: String) {
        // Captures the current date and time right now, converting it to a string using our formatter.
        let timestamp = formatter.string(from: Date())
        
        // Prints the structured log line to the console terminal using string interpolation.
        // E.g., "[2026-06-26 17:02:31] [INFO] Heartbeat monitor started"
        // 'level.rawValue' grabs the uppercase string defined in the enum above (like "INFO").
        print("[\(timestamp)] [\(level.rawValue)] \(message)")
        
        // Forces the system console buffer to flush immediately. 
        // This guarantees that logs appear in the terminal instantly without lag, even during a crash.
        fflush(stdout)
    }

    // Public function for verbose messages used strictly during development troubleshooting.
    func debug(_ message: String) {
        // Routes the message to the master log function with the '.debug' enum case.
        log(.debug, message)
    }

    // Public function for general operational status messages (e.g., "Node process started").
    func info(_ message: String) {
        log(.info, message)
    }

    // Public function for non-critical anomalies or unexpected minor issues.
    func warning(_ message: String) {
        log(.warning, message)
    }

    // Public function for serious issues or operation failures that need attention but aren't fatal.
    func error(_ message: String) {
        log(.error, message)
    }

    // Public function for catastrophic failures. 
    // '-> Never' is a special return type indicating that this function will *never* return to the caller,
    // because it intentionally shuts down the entire program execution right here.
    func fatal(_ message: String) -> Never {
        // Logs the catastrophic error message with the '.fatal' severity tag.
        log(.fatal, message)
        
        // Invokes a low-level C system command to instantly terminate the application.
        // 'EXIT_FAILURE' tells the operating system that the app closed due to a critical crash.
        exit(EXIT_FAILURE)
    }
}