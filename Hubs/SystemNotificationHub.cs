using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Threading.Tasks;

namespace BenefitNetFlex.Sample.Hubs
{
    [HubName("systemNotificationHub")]
    public class SystemNotificationHub : Hub
    {
        /// <summary>
        /// Called when a client connects
        /// </summary>
        public override Task OnConnected()
        {
            var connectionId = Context.ConnectionId;
            var user = Context.User?.Identity?.Name ?? "Anonymous";

            // Log connection or perform initialization
            System.Diagnostics.Debug.WriteLine($"User {user} connected with ID: {connectionId}");

            return base.OnConnected();
        }

        /// <summary>
        /// Called when a client disconnects
        /// </summary>
        public override Task OnDisconnected(bool stopCalled)
        {
            var connectionId = Context.ConnectionId;
            var user = Context.User?.Identity?.Name ?? "Anonymous";

            // Log disconnection or perform cleanup
            System.Diagnostics.Debug.WriteLine($"User {user} disconnected with ID: {connectionId}");

            return base.OnDisconnected(stopCalled);
        }

        /// <summary>
        /// Handles persistent logoff across multiple sessions
        /// </summary>
        public void PersistentLogOff()
        {
            var user = Context.User?.Identity?.Name;
            if (!string.IsNullOrEmpty(user))
            {
                // Notify all clients of this user to log off
                Clients.Group(user).persistentLogOff();
            }
        }

        /// <summary>
        /// Send a notification to all connected clients
        /// </summary>
        public void SendNotification(string title, string message, string type = "info")
        {
            Clients.All.receiveNotification(title, message, type);
        }

        /// <summary>
        /// Send a notification to a specific user
        /// </summary>
        public void SendNotificationToUser(string userId, string title, string message, string type = "info")
        {
            Clients.Group(userId).receiveNotification(title, message, type);
        }

        /// <summary>
        /// Join a group (typically used for user-specific notifications)
        /// </summary>
        public Task JoinGroup(string groupName)
        {
            return Groups.Add(Context.ConnectionId, groupName);
        }

        /// <summary>
        /// Leave a group
        /// </summary>
        public Task LeaveGroup(string groupName)
        {
            return Groups.Remove(Context.ConnectionId, groupName);
        }

        /// <summary>
        /// Update user activity time
        /// </summary>
        public void UpdateActivity()
        {
            var user = Context.User?.Identity?.Name;
            if (!string.IsNullOrEmpty(user))
            {
                // In a real application, update the user's last activity time in the database
                System.Diagnostics.Debug.WriteLine($"Activity updated for user: {user}");
            }
        }
    }
}