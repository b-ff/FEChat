const generateClientId = (): string => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return Date.now()
        .toString()
        .split('')
        .map((char: string): string => alphabet[parseInt(char)])
        .join('')
}

export default class Client {
    constructor (
        public clientId: string,
        public name: string
    ) {}

    static get defaultName (): string {
        return 'Guest'
    }    

    static build (dto: any): Client {
        return new Client(
            dto.clientId || generateClientId(),
            dto.name || Client.defaultName
        )
    }
}