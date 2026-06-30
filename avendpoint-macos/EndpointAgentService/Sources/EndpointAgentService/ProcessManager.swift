import Foundation

final class ProcessManager {

    // MARK: - Properties

    private var process: Process?

    private var status: AgentStatus = .stopped

    private let logger = Logger.shared

    // MARK: - Environment

    private func buildEnvironment() -> [String: String] {

        var env = ProcessInfo.processInfo.environment

        env["ENDPOINT_ENV"] =
            Constants.appDirectory == Constants.productionRoot
                ? "production"
                : "development"

        return env
    }

    // MARK: - Logging Helpers

    private func attachOutputHandlers(
        stdout: Pipe,
        stderr: Pipe
    ) {

        stdout.fileHandleForReading.readabilityHandler = { handle in

            let data = handle.availableData

            guard !data.isEmpty else {
                return
            }

            if let text = String(
                data: data,
                encoding: .utf8
            ) {

                self.logger.info(
                    text.trimmingCharacters(
                        in: .whitespacesAndNewlines
                    )
                )

            }

        }

        stderr.fileHandleForReading.readabilityHandler = { handle in

            let data = handle.availableData

            guard !data.isEmpty else {
                return
            }

            if let text = String(
                data: data,
                encoding: .utf8
            ) {

                self.logger.error(
                    text.trimmingCharacters(
                        in: .whitespacesAndNewlines
                    )
                )

            }

        }

    }

    // MARK: - Validation

    private func validateFiles() {

        guard FileManager.default.fileExists(
            atPath: Constants.nodeExecutable
        ) else {

            logger.fatal(
                "Node executable not found: \(Constants.nodeExecutable)"
            )

        }

        guard FileManager.default.fileExists(
            atPath: Constants.nodeScript
        ) else {

            logger.fatal(
                "Node script not found: \(Constants.nodeScript)"
            )

        }

    }

    // MARK: - Process Lifecycle

        func startNode() {

        if isRunning() {

            logger.debug("Node process already running")

            return

        }

        validateFiles()

        let proc = Process()

        proc.environment = buildEnvironment()

        proc.executableURL = URL(
            fileURLWithPath: Constants.nodeExecutable
        )

        proc.arguments = [
            Constants.nodeScript
        ]

        proc.currentDirectoryURL = URL(
            fileURLWithPath: Constants.appDirectory
        )

        let stdout = Pipe()
        let stderr = Pipe()

        proc.standardOutput = stdout
        proc.standardError = stderr

        attachOutputHandlers(
            stdout: stdout,
            stderr: stderr
        )

        proc.terminationHandler = { process in

            self.logger.warning(
                "Node exited with code \(process.terminationStatus)"
            )

            self.process = nil
            self.status = .stopped

        }

        do {

            try proc.run()

            process = proc

            status = .running

            logger.info(
                "Started Node (PID \(proc.processIdentifier))"
            )

        } catch {

            logger.fatal(
                "Failed to launch Node: \(error)"
            )

        }

    }

    func stopNode() {

        guard let process else {

            status = .stopped

            return

        }

        logger.info("Stopping Node...")

        process.terminate()

        process.waitUntilExit()

        self.process = nil

        status = .stopped

        logger.info("Node stopped")

    }

    func restartNode() {

        logger.warning("Restarting Node...")

        status = .restarting

        stopNode()

        Thread.sleep(
            forTimeInterval: Constants.restartDelay
        )

        startNode()

    }
        // MARK: - State Helpers

    func isRunning() -> Bool {

        guard let process else {
            return false
        }

        return process.isRunning

    }

    func currentPid() -> Int32? {

        process?.processIdentifier

    }

    private func heartbeatAge() -> Int? {

        let path = Constants.heartbeatFile

        guard FileManager.default.fileExists(atPath: path) else {
            return nil
        }

        do {

            let attributes =
                try FileManager.default.attributesOfItem(
                    atPath: path
                )

            guard let modified =
                attributes[.modificationDate] as? Date
            else {
                return nil
            }

            return Int(
                Date().timeIntervalSince(modified)
            )

        } catch {

            logger.error(
                "Failed to read heartbeat file: \(error)"
            )

            return nil

        }

    }

    func currentState() -> AgentState {

        AgentState(
            status: status,
            pid: currentPid(),
            heartbeatAge: heartbeatAge()
        )

    }

}