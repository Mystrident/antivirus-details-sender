import Foundation

enum Constants {

    // MARK: - Application

    static let appDirectory =
        "/Library/Application Support/EndpointAgent"

    static let nodeExecutable =
        "\(appDirectory)/node"

    static let nodeScript =
        "\(appDirectory)/dist/index.js"

    static let configFile =
        "\(appDirectory)/config.json"

    static let heartbeatFile =
        "\(appDirectory)/heartbeat.txt"

    // MARK: - IPC

    static let socketPath =
        "/var/run/endpointagent.sock"

    // MARK: - Health Monitoring

    /// Restart Node if heartbeat is older than 5 minutes.
    static let heartbeatTimeout: TimeInterval = 300

    /// Check heartbeat every minute.
    static let healthCheckInterval: TimeInterval = 60

    // MARK: - Restart 

    static let restartDelay: TimeInterval = 5
}