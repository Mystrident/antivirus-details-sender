
import Foundation

final class IPCClient {

    private let socket = SocketClient()

    func ping() throws -> IPCResponse {

        try socket.send(
            IPCRequest(action: .ping)
        )

    }

    func status() throws -> IPCResponse {

        try socket.send(
            IPCRequest(action: .status)
        )

    }

    func restart() throws -> IPCResponse {

        try socket.send(
            IPCRequest(action: .restart)
        )

    }

    func shutdown() throws -> IPCResponse {

        try socket.send(
            IPCRequest(action: .shutdown)
        )

    }
}