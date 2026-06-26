import Foundation

let logger = Logger.shared

logger.info("===================================")
logger.info("Endpoint Agent Service Starting...")
logger.info("===================================")

let processManager = ProcessManager()

processManager.startNode()

let heartbeatMonitor = HeartbeatMonitor(
    manager: processManager
)

heartbeatMonitor.start()

let socketServer = SocketServer(
    manager: processManager
)

socketServer.start()

logger.info("Endpoint Agent Service Started")

signal(SIGINT) { _ in

    Logger.shared.info("Stopping service...")

    socketServer.stop()

    heartbeatMonitor.stop()

    processManager.stopNode()

    exit(EXIT_SUCCESS)

}

signal(SIGTERM) { _ in

    Logger.shared.info("Stopping service...")

    socketServer.stop()

    heartbeatMonitor.stop()

    processManager.stopNode()

    exit(EXIT_SUCCESS)

}

dispatchMain()