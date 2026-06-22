using System;
using System.Drawing;
using System.Windows.Forms;
using System.Timers;

namespace EndpointTrayManager
{
    public partial class TrayForm : Form
    {
        private NotifyIcon _trayIcon;
        private ContextMenuStrip _contextMenu;
        private PipeClient _pipeClient;
        private System.Timers.Timer _statusCheckTimer;
        private bool _isRunning;

        public TrayForm()
        {
            InitializeComponent();
            this.ShowInTaskbar = false;
            this.WindowState = FormWindowState.Hidden;
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

            // Status label
            var statusLabel = new ToolStripMenuItem("Status: Unknown");
            statusLabel.Enabled = false;
            statusLabel.Name = "StatusLabel";
            _contextMenu.Items.Add(statusLabel);

            _contextMenu.Items.Add(new ToolStripSeparator());

            // Start button
            var startItem = new ToolStripMenuItem("Start Agent");
            startItem.Click += (s, e) => StartAgent();
            startItem.Name = "StartItem";
            _contextMenu.Items.Add(startItem);

            // Stop button
            var stopItem = new ToolStripMenuItem("Stop Agent");
            stopItem.Click += (s, e) => StopAgent();
            stopItem.Name = "StopItem";
            _contextMenu.Items.Add(stopItem);

            _contextMenu.Items.Add(new ToolStripSeparator());

            // Exit button
            var exitItem = new ToolStripMenuItem("Exit Manager");
            exitItem.Click += (s, e) => ExitManager();
            _contextMenu.Items.Add(exitItem);
        }

        private void InitializeTrayIcon()
        {
            _trayIcon = new NotifyIcon();
            _trayIcon.ContextMenuStrip = _contextMenu;
            _trayIcon.Visible = true;
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
            this.Invoke((MethodInvoker)delegate
            {
                try
                {
                    string statusJson = _pipeClient.SendCommand("GET_STATUS");
                    _isRunning = statusJson.Contains("\"status\":\"RUNNING\"");

                    // Update context menu
                    foreach (ToolStripItem item in _contextMenu.Items)
                    {
                        if (item.Name == "StatusLabel")
                        {
                            item.Text = _isRunning ? "Status: Running" : "Status: Stopped";
                        }
                        else if (item.Name == "StartItem")
                        {
                            item.Enabled = !_isRunning;
                        }
                        else if (item.Name == "StopItem")
                        {
                            item.Enabled = _isRunning;
                        }
                    }

                    UpdateTrayIcon();
                }
                catch (Exception ex)
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
            });
        }

        private void UpdateTrayIcon()
        {
            if (_isRunning)
            {
                // Green icon for running
                _trayIcon.Icon = CreateColoredIcon(Color.Green);
                _trayIcon.Text = "Endpoint Agent - Running";
            }
            else
            {
                // Red icon for stopped
                _trayIcon.Icon = CreateColoredIcon(Color.Red);
                _trayIcon.Text = "Endpoint Agent - Stopped";
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
                    MessageBox.Show("Agent started successfully.", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    UpdateServiceStatus();
                }
                else
                {
                    MessageBox.Show("Failed to start agent.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void StopAgent()
        {
            try
            {
                string response = _pipeClient.SendCommand("STOP_AGENT");
                if (response.Contains("SUCCESS"))
                {
                    MessageBox.Show("Agent stopped successfully.", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    UpdateServiceStatus();
                }
                else
                {
                    MessageBox.Show("Failed to stop agent.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void ToggleVisibility()
        {
            if (this.Visible)
            {
                this.Hide();
                this.WindowState = FormWindowState.Hidden;
            }
            else
            {
                this.Show();
                this.WindowState = FormWindowState.Normal;
            }
        }

        private void ExitManager()
        {
            _statusCheckTimer.Stop();
            _trayIcon.Visible = false;
            Application.Exit();
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true;
                this.Hide();
                this.WindowState = FormWindowState.Hidden;
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
