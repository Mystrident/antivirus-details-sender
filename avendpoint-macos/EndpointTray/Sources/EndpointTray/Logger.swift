import Foundation

enum LogLevel: String {

    case info = "INFO"

    case warning = "WARN"

    case error = "ERROR"

}

final class Logger {

    static let shared: Logger = Logger()

    private let formatter: DateFormatter = DateFormatter()

    private init() {

        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"

    }

    private func log(
        _ level: LogLevel,
        _ message: String
    ) {

        let ts: String = formatter.string(from: Date())

        print("[\(ts)] [\(level.rawValue)] \(message)")

    }

    func info(_ msg: String) {

        log(.info, msg)

    }

    func warning(_ msg: String) {

        log(.warning, msg)

    }

    func error(_ msg: String) {

        log(.error, msg)

    }

}