using System;
using System.Drawing;
using System.Timers;
using System.Windows.Forms;

namespace EndpointTrayManager
{
    public partial class TrayForm : Form
    {
        private NotifyIcon _trayIcon;
        private ContextMenuStrip _contextMenu;
        private PipeClient _pipeClient;
        private System.Timers.Timer _statusCheckTimer;
        private bool _isRunning;

        private Icon _greenIcon;
        private Icon _redIcon;

        public TrayForm()
        {
            InitializeComponent();
            this.ShowInTaskbar = false;
            this.WindowState = FormWindowState.Minimized;
            this.FormBorderStyle = FormBorderStyle.None;
            this.Size = new Size(0, 0);

            _pipeClient = new PipeClient();
            InitializeContextMenu();
            InitializeTrayIcon();
            InitializeStatusCheck();
            UpdateServiceStatus();
        }

        private void InitializeContextMenu()
        {
            _contextMenu = new ContextMenuStrip();

            var statusLabel = new ToolStripMenuItem("Status: Unknown");
            statusLabel.Enabled = false;
            statusLabel.Name = "StatusLabel";
            _contextMenu.Items.Add(statusLabel);

            _contextMenu.Items.Add(new ToolStripSeparator());

            var restartItem = new ToolStripMenuItem("Restart Agent");
            restartItem.Name = "RestartItem";
            restartItem.Click += (s, e) => RestartAgent();

            _contextMenu.Items.Add(restartItem);

            _contextMenu.Items.Add(new ToolStripSeparator());

            var exitItem = new ToolStripMenuItem("Exit Manager");
            exitItem.Click += (s, e) => ExitManager();

            _contextMenu.Items.Add(exitItem);
        }

        private void InitializeTrayIcon()
        {
            _greenIcon = CreateColoredIcon(Color.Green);
            _redIcon = CreateColoredIcon(Color.Red);

            _trayIcon = new NotifyIcon { ContextMenuStrip = _contextMenu, Visible = true };

            _trayIcon.DoubleClick += (s, e) => ToggleVisibility();

            UpdateTrayIcon();
        }

        private void InitializeStatusCheck()
        {
            _statusCheckTimer = new System.Timers.Timer(5000); // Check every 5 seconds
            _statusCheckTimer.Elapsed += (s, e) => UpdateServiceStatus();
            _statusCheckTimer.AutoReset = true;
            _statusCheckTimer.Start();
        }

        private void UpdateServiceStatus()
        {
            if (!IsHandleCreated)
                return;

            this.Invoke(
                (MethodInvoker)
                    delegate
                    {
                        try
                        {
                            string statusJson = _pipeClient.SendCommand("GET_STATUS");

                            _isRunning = statusJson.Contains("\"status\":\"RUNNING\"");

                            foreach (ToolStripItem item in _contextMenu.Items)
                            {
                                if (item.Name == "StatusLabel")
                                {
                                    item.Text = _isRunning ? "Status: Running" : "Status: Stopped";
                                }
                                else if (item.Name == "RestartItem")
                                {
                                    item.Enabled = _isRunning;
                                }
                            }

                            UpdateTrayIcon();
                        }
                        catch
                        {
                            foreach (ToolStripItem item in _contextMenu.Items)
                            {
                                if (item.Name == "StatusLabel")
                                {
                                    item.Text = "Status: Error";
                                }
                            }

                            _trayIcon.Icon = SystemIcons.Warning;
                        }
                    }
            );
        }

        private void UpdateTrayIcon()
        {
            if (_isRunning)
            {
                _trayIcon.Icon = _greenIcon;
                _trayIcon.Text = "Endpoint Agent - Running";
            }
            else
            {
                _trayIcon.Icon = _redIcon;
                _trayIcon.Text = "Endpoint Agent - Offline";
            }
        }

        private void RestartAgent()
        {
            try
            {
                string response = _pipeClient.SendCommand("STOP_AGENT");

                if (!response.Contains("SUCCESS"))
                {
                    MessageBox.Show(
                        "Failed to stop agent.",
                        "Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );

                    return;
                }

                System.Threading.Thread.Sleep(2000);

                response = _pipeClient.SendCommand("START_AGENT");

                if (!response.Contains("SUCCESS"))
                {
                    MessageBox.Show(
                        "Failed to start agent.",
                        "Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );

                    return;
                }

                UpdateServiceStatus();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private Icon CreateColoredIcon(Color color)
        {
            Bitmap bitmap = new Bitmap(16, 16);
            using (Graphics g = Graphics.FromImage(bitmap))
            {
                g.Clear(Color.Transparent);
                g.FillEllipse(new SolidBrush(color), 2, 2, 12, 12);
                g.DrawEllipse(Pens.Black, 2, 2, 12, 12);
            }
            return Icon.FromHandle(bitmap.GetHicon());
        }

        private void StartAgent()
        {
            try
            {
                string response = _pipeClient.SendCommand("START_AGENT");
                if (response.Contains("SUCCESS"))
                {
                    MessageBox.Show(
                        "Agent started successfully.",
                        "Success",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Information
                    );
                    UpdateServiceStatus();
                }
                else
                {
                    MessageBox.Show(
                        "Failed to start agent.",
                        "Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Error: {ex.Message}",
                    "Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        private void StopAgent()
        {
            try
            {
                string response = _pipeClient.SendCommand("STOP_AGENT");
                if (response.Contains("SUCCESS"))
                {
                    MessageBox.Show(
                        "Agent stopped successfully.",
                        "Success",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Information
                    );
                    UpdateServiceStatus();
                }
                else
                {
                    MessageBox.Show(
                        "Failed to stop agent.",
                        "Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Error: {ex.Message}",
                    "Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        private void ToggleVisibility()
        {
            if (this.Visible)
            {
                this.Hide();
                this.WindowState = FormWindowState.Minimized;
            }
            else
            {
                this.Show();
                this.WindowState = FormWindowState.Normal;
            }
        }

        private void ExitManager()
        {
            _statusCheckTimer?.Stop();
            _statusCheckTimer?.Dispose();

            _trayIcon.Visible = false;
            _trayIcon.Dispose();

            _greenIcon?.Dispose();
            _redIcon?.Dispose();

            Application.Exit();
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true;
                this.Hide();
                this.WindowState = FormWindowState.Minimized;
            }
            base.OnFormClosing(e);
        }

        private void InitializeComponent()
        {
            this.SuspendLayout();
            this.Name = "TrayForm";
            this.Text = "Endpoint Agent Manager";
            this.ResumeLayout(false);
        }
    }
}
