import Foundation

final class SocketServer {

    private let manager: ProcessManager
    private let logger = Logger.shared

    private var socketFD: Int32 = -1

    init(manager: ProcessManager) {
        self.manager = manager
    }

    func start() {

        unlink(Constants.socketPath)

        socketFD = socket(AF_UNIX, SOCK_STREAM, 0)

        guard socketFD >= 0 else {
            logger.fatal("Unable to create socket")
        }

        var address = sockaddr_un()

        address.sun_family = sa_family_t(AF_UNIX)

        let maxLength = MemoryLayout.size(ofValue: address.sun_path)

        Constants.socketPath.withCString { ptr in
            strncpy(&address.sun_path.0, ptr, maxLength - 1)
        }

        let length = socklen_t(MemoryLayout<sockaddr_un>.size)

        let result = withUnsafePointer(to: &address) {

            $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {

                bind(socketFD, $0, length)

            }

        }

        guard result == 0 else {
            logger.fatal("Socket bind failed")
        }

        listen(socketFD, 5)

        logger.info("Socket server started")

        DispatchQueue.global().async {

            self.acceptLoop()

        }
    }

    func stop() {

        if socketFD >= 0 {

            close(socketFD)

            unlink(Constants.socketPath)

            socketFD = -1
        }
    }

    private func acceptLoop() {

        while true {

            let client = accept(socketFD, nil, nil)

            if client < 0 {

                continue

            }

            DispatchQueue.global().async {

                self.handleClient(client)

            }
        }
    }

    private func handleClient(_ client: Int32) {

    defer {
        close(client)
    }

    var buffer = [UInt8](repeating: 0, count: 4096)

    let count = read(client, &buffer, buffer.count)

    guard count > 0 else {
        return
    }

    do {

        let request = try JSONDecoder().decode(
            IPCRequest.self,
            from: Data(buffer.prefix(count))
        )

        logger.info("IPC Action: \(request.action)")

        let response = process(request)

        let data = try JSONEncoder().encode(response)

        data.withUnsafeBytes {

            _ = write(
                client,
                $0.baseAddress!,
                data.count
            )

        }

    } catch {

        logger.error("Invalid IPC Request")

        let response = IPCResponse(
            success: false,
            message: "Invalid request",
            status: nil,
            pid: nil,
            heartbeatAge: nil
        )

        if let data = try? JSONEncoder().encode(response) {

            data.withUnsafeBytes {

                _ = write(
                    client,
                    $0.baseAddress!,
                    data.count
                )

            }

        }
    }
}

private func process(_ request: IPCRequest) -> IPCResponse {

    switch request.action {

    case .ping:

    return IPCResponse(

        success: true,

        message: "PONG",

        state: nil

    )

    case .status:

    let state = manager.currentState()

    return IPCResponse(

        success: true,

        message: nil,

        state: AgentStateDTO(

            status: state.status,

            pid: state.pid,

            heartbeatAge: state.heartbeatAge

        )

    )

    case .restart:

    manager.restartNode()

    let state = manager.currentState()

    return IPCResponse(

        success: true,

        message: "Node restarted",

        state: AgentStateDTO(

            status: state.status,

            pid: state.pid,

            heartbeatAge: state.heartbeatAge

        )

    )

    case .shutdown:

    manager.stopNode()

    return IPCResponse(

        success: true,

        message: "Node stopped",

        state: AgentStateDTO(

            status: .stopped,

            pid: nil,

            heartbeatAge: nil

        )

    )

    case .heartbeat:

        let age = HeartbeatMonitor.currentHeartbeatAge()

        return IPCResponse(
            success: true,
            message: nil,
            status: manager.isRunning()
                ? .running
                : .stopped,
            pid: manager.currentPid(),
            heartbeatAge: age
        )
    }
}

static func currentHeartbeatAge() -> Int? {

    let path = Constants.heartbeatFile

    guard FileManager.default.fileExists(atPath: path) else {
        return nil
    }

    do {

        let attr = try FileManager.default.attributesOfItem(
            atPath: path
        )

        guard let modified =
            attr[.modificationDate] as? Date
        else {
            return nil
        }

        return Int(
            Date().timeIntervalSince(modified)
        )

    } catch {

        return nil

    }

}
}   