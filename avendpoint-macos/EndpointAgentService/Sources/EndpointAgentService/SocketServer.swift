import Foundation

final class SocketServer {

    private let manager: ProcessManager
    private let logger: Logger = Logger.shared

    private var socketFD: Int32 = -1

    init(manager: ProcessManager) {
        self.manager = manager
    }

    private func makeStateDTO() -> AgentStateDTO {

        let state: AgentState = manager.currentState()

        return AgentStateDTO(
            status: state.status,
            pid: state.pid,
            heartbeatAge: state.heartbeatAge
            )
        }

    func start() {

        logger.info("Socket path: \(Constants.socketPath)")
        
        let socketDirectory = "\(Constants.appDirectory)/run"

try? FileManager.default.createDirectory(
    atPath: socketDirectory,
    withIntermediateDirectories: true
)

unlink(Constants.socketPath)

        socketFD = socket(AF_UNIX, SOCK_STREAM, 0)

        guard socketFD >= 0 else {
            logger.fatal("Unable to create socket")
        }

        var address: sockaddr_un = sockaddr_un()

        address.sun_family = sa_family_t(AF_UNIX)

        let maxLength: Int = MemoryLayout.size(ofValue: address.sun_path)

        Constants.socketPath.withCString { ptr in
            strncpy(&address.sun_path.0, ptr, maxLength - 1)
        }

        let length: socklen_t = socklen_t(MemoryLayout<sockaddr_un>.size)

        let result: Int32 = withUnsafePointer(to: &address) {

            $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {

                bind(socketFD, $0, length)

            }

        }

        guard result == 0 else {
            logger.fatal("Socket bind failed: \(String(cString: strerror(errno)))")
        }

        chmod(Constants.socketPath, 0o666)

        logger.info("Socket created at: \(Constants.socketPath)")

        listen(socketFD, 5)

        logger.info("Socket server started")

        DispatchQueue.global().async {

            self.acceptLoop()

        }
    }

    func stop() {

        if socketFD >= 0 {

            close(socketFD)

            let socketDirectory = "\(Constants.appDirectory)/run"

try? FileManager.default.createDirectory(
    atPath: socketDirectory,
    withIntermediateDirectories: true
)

unlink(Constants.socketPath)

            socketFD = -1
        }
    }

    private func acceptLoop() {

        while true {

            let client: Int32 = accept(socketFD, nil, nil)

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

    var buffer: [UInt8] = [UInt8](repeating: 0, count: 4096)

    let count: Int = read(client, &buffer, buffer.count)

    guard count > 0 else {
        return
    }

    do {

        let request: IPCRequest = try JSONDecoder().decode(
            IPCRequest.self,
            from: Data(buffer.prefix(count))
        )

        logger.info("IPC Action: \(request.action)")

        let response: IPCResponse = process(request, clientFD: client)

        let data: Data = try JSONEncoder().encode(response)

        data.withUnsafeBytes {

            _ = write(
                client,
                $0.baseAddress!,
                data.count
            )

        }

    } catch {

        logger.error("Invalid IPC Request")

        let response: IPCResponse = IPCResponse(
    success: false,
    message: "Invalid request",
    state: nil
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

private func isPrivilegedCaller(_ clientFD: Int32) -> Bool {
    var uid: uid_t = 0
    var gid: gid_t = 0

    guard getpeereid(clientFD, &uid, &gid) == 0 else {
        return false
    }

    return uid == 0 // root; service itself runs as root per the LaunchDaemon plist
}

private func process(_ request: IPCRequest, clientFD: Int32) -> IPCResponse {

    switch request.action {

    case .ping:

        return IPCResponse(
            success: true,
            message: "PONG",
            state: nil
        )

    case .status:

        return IPCResponse(
            success: true,
            message: nil,
            state: makeStateDTO()
        )

    case .restart:

    logger.info("Restart requested")

    manager.restartNode()

    return IPCResponse(
        success: true,
        message: "Node restarted",
        state: makeStateDTO()
    )

    case .shutdown:

    logger.info("Shutdown requested")

    manager.stopNode()

    return IPCResponse(
        success: true,
        message: "Node stopped",
        state: makeStateDTO()
    )
    }
}

    
}

