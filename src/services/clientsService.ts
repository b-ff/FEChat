import Client from '../models/Client'

const CLIENTS_STORAGE_KEY = 'fechat-clients'

export class ClientsService {
    private clients: Client[] = []

    constructor () {}

    private getClients (): Client[] {
        this.clients = (JSON.parse(window.localStorage.getItem(CLIENTS_STORAGE_KEY)) || []).map(Client.build)
        return this.clients
    }

    getClientById (clientId: string): Client {
        return this.getClients().find((client: Client): boolean => client.clientId === clientId)
    }

    addClient (newClient: Client): void {
        const client = Client.build(newClient)

        this.getClients()

        if (!this.getClientById(client.clientId)) {
            this.clients.push(client)
            window.localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(this.clients))
        }
    }

    updateClient (updatedClient: Client): void {
        this.getClients()

        const clients = this.clients
            .filter((client: Client): boolean => client.clientId !== updatedClient.clientId)

        clients.push(Client.build(updatedClient))

        window.localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients))
        this.clients = clients
    }
}

export default new ClientsService()