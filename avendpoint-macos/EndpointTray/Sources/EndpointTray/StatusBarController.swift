import AppKit

final class StatusBarController {

    // MARK: - Properties

    private let ipc: IPCClient = IPCClient()

    private let logger: Logger = Logger.shared

    private let statusItem: NSStatusItem =
        NSStatusBar.system.statusItem(
            withLength: NSStatusItem.variableLength
        )

    private let menu: NSMenu = NSMenu()

    private let statusMenuItem: NSMenuItem =
        NSMenuItem(title: "Status : Unknown",
                   action: nil,
                   keyEquivalent: "")

    private let pidMenuItem: NSMenuItem =
        NSMenuItem(title: "PID : -",
                   action: nil,
                   keyEquivalent: "")

    

    private var timer: Timer?

    // MARK: - Init

    init() {

        setupStatusBar()

        refresh()

        timer = Timer.scheduledTimer(
            withTimeInterval: Constants.pollInterval,
            repeats: true
        ) { [weak self] _ in

            self?.refresh()

        }

    }

    // MARK: - UI

    private func setupStatusBar() {

        if let button: NSStatusBarButton = statusItem.button {

            button.title = "🛡"

        }

        menu.addItem(statusMenuItem)
        menu.addItem(pidMenuItem)
       

        menu.addItem(.separator())

        let restart: NSMenuItem =
            NSMenuItem(
                title: "Restart",
                action: #selector(restartAgent),
                keyEquivalent: ""
            )

        restart.target = self

        menu.addItem(restart)

        let shutdown: NSMenuItem =
            NSMenuItem(
                title: "Stop",
                action: #selector(stopAgent),
                keyEquivalent: ""
            )

        shutdown.target = self

        menu.addItem(shutdown)

        

        statusItem.menu = menu

    }

    // MARK: - Refresh

    private func refresh() {

        do {

            let response = try ipc.status()

            guard
                response.success,
                let state: AgentStateDTO = response.state
            else {

                updateDisconnected()

                return

            }

            updateUI(state)

        }

        catch {

            logger.error("\(error)")

            updateDisconnected()

        }

    }

    // MARK: - Update UI

    private func updateUI(
    _ state: AgentStateDTO
) {

    DispatchQueue.main.async {

        self.statusMenuItem.title =
            "Status: \(state.status.rawValue)"

        self.pidMenuItem.title =
            state.pid != nil
                ? "PID: \(state.pid!)"
                : "PID: -"

       

        switch state.status {

        case .running:
            self.statusItem.button?.title = "🟢"

        case .stopped:
            self.statusItem.button?.title = "🔴"

        case .restarting:
            self.statusItem.button?.title = "🟡"
        }

    }

}

    private func updateDisconnected() {

        statusMenuItem.title =
            "Status : Offline"

        pidMenuItem.title =
            "PID : -"

        

        statusItem.button?.title = "🔴"

    }

    // MARK: - Actions

    @objc
    private func restartAgent() {

        do {

            _ = try ipc.restart()

            refresh()

        }

        catch {

            logger.error("\(error)")

        }

    }

    @objc
    private func stopAgent() {

        do {

            _ = try ipc.shutdown()

            refresh()

        }

        catch {

            logger.error("\(error)")

        }

    }

    
}