using System;
using System.Drawing;
using System.Text.Json;
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

            var statusLabel = new ToolStripMenuItem("Status: Unknown")
            {
                Enabled = false,
                Name = "StatusLabel",
            };

            var pidLabel = new ToolStripMenuItem("PID: -") { Enabled = false, Name = "PidLabel" };

            _contextMenu.Items.Add(statusLabel);
            _contextMenu.Items.Add(pidLabel);
            _contextMenu.Items.Add(new ToolStripSeparator());

            var restartItem = new ToolStripMenuItem("Restart");
            restartItem.Name = "RestartItem";
            restartItem.Click += (s, e) => RestartAgent();
            _contextMenu.Items.Add(restartItem);

            var stopItem = new ToolStripMenuItem("Stop");
            stopItem.Name = "StopItem";
            stopItem.Click += (s, e) => StopAgent();
            _contextMenu.Items.Add(stopItem);
        }

        private void InitializeTrayIcon()
        {
            _greenIcon = CreateColoredIcon(Color.Green);
            _redIcon = CreateColoredIcon(Color.Red);

            _trayIcon = new NotifyIcon { ContextMenuStrip = _contextMenu, Visible = true };

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

                            using JsonDocument doc = JsonDocument.Parse(statusJson);

                            _isRunning =
                                doc.RootElement.GetProperty("status").GetString() == "RUNNING";

                            int pid = doc.RootElement.GetProperty("processId").GetInt32();

                            foreach (ToolStripItem item in _contextMenu.Items)
                            {
                                switch (item.Name)
                                {
                                    case "StatusLabel":
                                        item.Text = _isRunning
                                            ? "Status: Running"
                                            : "Status: Stopped";
                                        break;

                                    case "PidLabel":
                                        item.Text = _isRunning ? $"PID: {pid}" : "PID: -";
                                        break;
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

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        private static extern bool DestroyIcon(IntPtr handle);

        private Icon CreateColoredIcon(Color color)
        {
            using Bitmap bitmap = new Bitmap(16, 16);
            using (Graphics g = Graphics.FromImage(bitmap))
            {
                g.Clear(Color.Transparent);
                g.FillEllipse(new SolidBrush(color), 2, 2, 12, 12);
                g.DrawEllipse(Pens.Black, 2, 2, 12, 12);
            }

            IntPtr hIcon = bitmap.GetHicon();
            Icon icon = (Icon)Icon.FromHandle(hIcon).Clone();
            DestroyIcon(hIcon);
            return icon;
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
