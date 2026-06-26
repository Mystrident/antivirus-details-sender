//core data types (like Date, Data, and URL) 
// and essential system services required for most Swift applications.
import Foundation 


// ': String' means each case has an underlying String value (Raw Value).
// ': Codable' is a protocol that allows this enum to be easily converted to/from JSON.
enum AgentStatus: String, Codable {

    // Represents the 'running' state of the agent. Its raw string value is "running".
    case running


    case stopped


    case restarting

}

struct AgentState {

    // A constant property (defined by 'let') holding the agent's current status.
    // It uses the custom 'AgentStatus' enum we defined above.
    let status: AgentStatus

    // A constant property holding the Process ID (PID).
    // The '?' makes it an "Optional" Int32, meaning it can either hold a 32-bit integer OR be 'nil' (empty/no value).
    let pid: Int32?

    // A constant property holding the age of the last heartbeat in seconds.
    // Like 'pid', the '?' means this is an Optional integer; it can be 'nil' if no heartbeat exists yet.
    let heartbeatAge: Int?

}