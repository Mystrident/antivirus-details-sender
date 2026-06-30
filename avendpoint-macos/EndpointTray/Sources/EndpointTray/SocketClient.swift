import Foundation

final class SocketClient {

    private let logger: Logger = Logger.shared

    func send(
        _ request: IPCRequest
    ) throws -> IPCResponse {

        let socketFD: Int32 = socket(AF_UNIX, SOCK_STREAM, 0)

        guard socketFD >= 0 else {
            throw SocketError.socketCreationFailed
        }

        defer {
            close(socketFD)
        }

        var address: sockaddr_un = sockaddr_un()

        address.sun_family = sa_family_t(AF_UNIX)

        Constants.socketPath.withCString { ptr in

            strncpy(
                &address.sun_path.0,
                ptr,
                MemoryLayout.size(ofValue: address.sun_path) - 1
            )

        }

        let result: Int32 = withUnsafePointer(to: &address) {

            $0.withMemoryRebound(
                to: sockaddr.self,
                capacity: 1
            ) {

                connect(
                    socketFD,
                    $0,
                    socklen_t(
                        MemoryLayout<sockaddr_un>.size
                    )
                )

            }

        }

        guard result == 0 else {
            throw SocketError.connectionFailed
        }

        let requestData: Data = try JSONEncoder().encode(request)

        try requestData.withUnsafeBytes {

            guard let ptr: UnsafeRawPointer = $0.baseAddress else {
                throw SocketError.writeFailed
            }

            let written: Int = write(
                socketFD,
                ptr,
                requestData.count
            )

            if written < 0 {
                throw SocketError.writeFailed
            }

        }

        var buffer: [UInt8] = [UInt8](
            repeating: 0,
            count: 4096
        )

        let count: Int = read(
            socketFD,
            &buffer,
            buffer.count
        )

        guard count > 0 else {
            throw SocketError.readFailed
        }

        let data: Data = Data(
            buffer.prefix(count)
        )

        return try JSONDecoder().decode(
            IPCResponse.self,
            from: data
        )

    }

}