import Message from '../models/Message';

const MESSAGES_STORAGE_KEY = 'fechat-messages'

class MessagesService {
    private messages: Message[] = []

    constructor () {}

    getMessages (): Message[] {
        this.messages = (JSON.parse(window.localStorage.getItem(MESSAGES_STORAGE_KEY)) || []).map(Message.build)
        return this.messages
    }

    sendMessage (message: Message): void {
        this.getMessages()
        this.messages.push(Message.build(message))
        this.postMessages()
    }

    private postMessages (): void {
        window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(this.messages))
    }

    clearMessages (): void {
        window.localStorage.removeItem(MESSAGES_STORAGE_KEY)
    }
}

export default new MessagesService()