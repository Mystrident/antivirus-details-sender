import Foundation

enum SocketError: Error {
    case socketCreationFailed
    case connectionFailed
    case writeFailed
    case readFailed
}