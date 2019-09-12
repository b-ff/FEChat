import Message from '../models/Message';
import { executionAsyncId } from 'async_hooks';

const MESSAGES_STORAGE_KEY = 'fechat-messages'

class MessagesService {
    public messages: Message[] = []

    constructor () {
        this.getMessages()
    }

    getMessages (): Message[] {
        console.log('Receiving messages!')
        this.messages = JSON.parse(window.localStorage.getItem(MESSAGES_STORAGE_KEY)) || []
        return this.messages
    }

    sendMessage (message: Message): void {
        this.getMessages()
        this.messages.push(message)
        this.postMessages()
    }

    postMessages (): void {
        console.log('Posting messages!')
        window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(this.messages))
    }

    clearMessages (): void {
        window.localStorage.removeItem(MESSAGES_STORAGE_KEY)
    }
}

export default new MessagesService()