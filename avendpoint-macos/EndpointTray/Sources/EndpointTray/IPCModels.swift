import Foundation

enum IPCAction: String, Codable {

    case ping

    case status

    case restart

    case shutdown

}

struct IPCRequest: Codable {

    let action: IPCAction

}

enum AgentStatus: String, Codable {

    case running

    case stopped

    case restarting

}

struct AgentStateDTO: Codable {

    let status: AgentStatus

    let pid: Int32?

    let heartbeatAge: Int?

}

struct IPCResponse: Codable {

    let success: Bool

    let message: String?

    let state: AgentStateDTO?

}