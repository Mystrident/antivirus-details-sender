import Foundation

enum Constants {

    private static let fileManager = FileManager.default

    /// Folder containing the Swift executable
    static var executableDirectory: String {
        URL(fileURLWithPath: CommandLine.arguments[0])
            .deletingLastPathComponent()
            .path
    }

    /// Development repo root
    static var developmentRoot: String {
        URL(fileURLWithPath: executableDirectory)
            .deletingLastPathComponent()   // EndpointAgentService
            .deletingLastPathComponent()   // .build
            .deletingLastPathComponent()   // project root
            .path
    }

    /// Installed application
    static let productionRoot =
        "/Library/Application Support/EndpointAgent"

    static var appDirectory: String {

        if fileManager.fileExists(
            atPath: "\(developmentRoot)/package.json"
        ) {
            return developmentRoot
        }

        return productionRoot
    }

    static var nodeExecutable: String {

        // During development use Homebrew Node
        if fileManager.fileExists(atPath: "/opt/homebrew/bin/node") {
            return "/opt/homebrew/bin/node"
        }

        // Intel Macs
        if fileManager.fileExists(atPath: "/usr/local/bin/node") {
            return "/usr/local/bin/node"
        }

        // Production
        return "\(productionRoot)/node"
    }

    static var nodeScript: String {
        "\(appDirectory)/dist/index.js"
    }

    static var heartbeatFile: String {
        "\(appDirectory)/heartbeat.txt"
    }
static var socketPath: String {

    if appDirectory == productionRoot {
        return "/var/run/endpointagent.sock"
    }

    return "/tmp/endpointagent.sock"
}

    static let heartbeatTimeout: TimeInterval = 180
    static let healthCheckInterval: TimeInterval = 60
    static let restartDelay: TimeInterval = 5
}