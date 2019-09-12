import './chat.scss'
const template = require('./chat.pug')()

import Client from '../../models/Client'
import Message from '../../models/Message'

import messagesService from '../../services/messagesService'

const QUOTE = '&quot;'

const MESSAGES_CONTAINER_CLASS = '.chat__messages'
const NICKNAME_INPUT_CLASS = '.chat__input--name'
const MESSAGE_INPUT_CLASS = '.chat__input--message'

const ENTER_KEYCODE = 13

const POLLING_INTERVAL = 5000

export default class ChatComponent extends HTMLElement {
    private client: Client
    private messages: Message[] = []
    private pollingTimeoutID: number

    constructor () {
        super()
        this.classList.add('chat')
        this.client = Client.build({})
    }

    get template (): string { 
        return template
    }

    render (): void {
        this.innerHTML = this.template
        this.renderMessages()
    }

    renderMessages (): void {
        this.querySelector(MESSAGES_CONTAINER_CLASS).innerHTML =
            this.messages
                .map((message: Message): string => `<message-component message='${JSON.stringify(message)}'></message-component>`)
                .join('')
    }

    startPolling (): void {
        if (this.pollingTimeoutID) {
            window.clearTimeout(this.pollingTimeoutID)
        }

        this.messages = messagesService.getMessages()
        this.renderMessages()
        
        const messagesList = this.querySelector(MESSAGES_CONTAINER_CLASS)
        messagesList.scrollTop = messagesList.scrollHeight

        this.pollingTimeoutID = window.setTimeout((): void => this.startPolling(), POLLING_INTERVAL)
    }

    connectedCallback (): void {
        this.render()
        this.addEventListeners()
        this.startPolling()
    }

    disconnectedCallback (): void {
        window.clearTimeout(this.pollingTimeoutID)
        this.messages = null
    }

    addEventListeners (): void {
        this.querySelector(MESSAGE_INPUT_CLASS).addEventListener('keydown', (e: KeyboardEvent): void => this.handleMessageKeydown(e))
    }

    handleMessageKeydown (event: KeyboardEvent): void {
        const target = event.target as HTMLInputElement

        if (event.keyCode === ENTER_KEYCODE && target.value) {
            this.sendMessage(target.value)
            target.value = null
        }
    }

    sendMessage (messageText: string): void {
        const message = new Message(this.client.clientId, messageText, new Date())
        messagesService.sendMessage(message)
        this.startPolling()
    }
}

window.customElements.define('chat-component', ChatComponent)