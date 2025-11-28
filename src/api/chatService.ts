import * as signalR from "@microsoft/signalr";

export class ChatService {
    public hubConnection: signalR.HubConnection | null = null;
    private userId: string | number | null = null;

    constructor() {}

    // connect público, acepta userId opcional
    public async connect(userId?: string | number) {
        if (userId) this.userId = userId;

        if (!this.userId) {
            throw new Error("userId is required to connect");
        }

        // build connection including the userId in query string
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_BASE_URL}/chatHub?userId=${encodeURIComponent(this.userId)}`)
            .withAutomaticReconnect()
            .build();

        try {
            await this.hubConnection.start();
            console.log("SignalR connected as", this.userId);

        } catch (err) {
            console.error("Error while establishing connection:", err);
            // retry
            setTimeout(() => this.connect(this.userId || undefined), 5000);
        }
    }

    public async sendMessage(toUserId: string | number, solicitudId: string | number, message: string) {
        if (!this.hubConnection) throw new Error("Not connected");
        try {
            const fromUserId = this.userId!;
            const solId = Number(solicitudId);

            await this.hubConnection.invoke("SendMessage", fromUserId, toUserId, solId, message);
        } catch (err) {
            console.error("Error sending message:", err);
        }
    }

    public disconnect() {
        this.hubConnection?.stop();
        this.hubConnection = null;
    }
}