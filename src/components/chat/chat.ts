import './chat.scss'
const template = require('./chat.pug')()

import Client from '../../models/Client'
import Message from '../../models/Message'

import messagesService from '../../services/messagesService'

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
    }

    get template (): string { 
        return template
    }

    render (): void {
        this.innerHTML = this.template
        this.renderMessages()
    }

    renderMessages (): void {
        const renderMessagesList = (layout: string, message: Message) => {
            return layout + `<message-component message='${JSON.stringify(message)}'></message-component>`
        }

        this.querySelector(MESSAGES_CONTAINER_CLASS).innerHTML = Object.keys(this.messages).reduce((layout, localeDateString) => {
            const renderedMessagesForDate = this.messages[localeDateString].reduce(renderMessagesList, '')
            return layout + `<h3 class="chat__date">${localeDateString}</h3>${renderedMessagesForDate}`
        }, '')
    }

    connectedCallback (): void {
        this.classList.add('chat')
        this.client = Client.build({})
        this.loadMessages()
        this.render()
        this.addEventListeners()
    }

    disconnectedCallback (): void {
        window.clearTimeout(this.pollingTimeoutID)
        this.messages = null
    }

    scrollToNewestMessages (): void {
        const messagesList = this.querySelector(MESSAGES_CONTAINER_CLASS)
        messagesList.scrollTop = messagesList.scrollHeight
    }

    addEventListeners (): void {
        this.querySelector(MESSAGE_INPUT_CLASS).addEventListener('keydown', (e: KeyboardEvent): void => this.handleMessageKeydown(e))
        
        window.addEventListener('storage', () => {
            this.loadMessages()
            this.renderMessages()
            this.scrollToNewestMessages()
        })
    }

    loadMessages () {
        const messages = messagesService.getMessages()

        this.messages = messages.reduce((acc: any, message: Message): any => {
            const localeDateString = message.date.toLocaleDateString()
            if (!acc[localeDateString]) {
                acc[localeDateString] = []
            }

            acc[localeDateString].push(message)

            return acc
        }, {})
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
        this.loadMessages()
        this.renderMessages()
        this.scrollToNewestMessages()
    }
}

window.customElements.define('chat-component', ChatComponent)