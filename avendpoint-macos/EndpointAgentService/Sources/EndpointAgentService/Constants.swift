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

    var url = URL(fileURLWithPath: executableDirectory)

    for _ in 0..<5 {

        let candidate = url.appendingPathComponent("package.json")

        if FileManager.default.fileExists(atPath: candidate.path) {
            return url.path
        }

        url.deleteLastPathComponent()
    }

    return productionRoot
}

    static var nodeExecutable: String {

    if fileManager.fileExists(atPath: "/opt/homebrew/bin/node") {
        return "/opt/homebrew/bin/node"
    }

    if fileManager.fileExists(atPath: "/usr/local/bin/node") {
        return "/usr/local/bin/node"
    }

    return "\(productionRoot)/node/bin/node"
}

    static var nodeScript: String {
        "\(appDirectory)/dist/index.js"
    }

    static var heartbeatFile: String {
        "\(appDirectory)/heartbeat.txt"
    }
static var socketPath: String {
    "\(appDirectory)/run/endpointagent.sock"
}

    static let heartbeatTimeout: TimeInterval = 180
    static let healthCheckInterval: TimeInterval = 60
    static let restartDelay: TimeInterval = 5
}