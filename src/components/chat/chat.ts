import './chat.scss'
const template = require('./chat.pug')()

import Client from '../../models/Client'
import Message from '../../models/Message'

import messagesService from '../../services/messagesService'
import clientsService from '../../services/clientsService'

const MESSAGES_CONTAINER_CLASS = '.chat__messages'
const NICKNAME_INPUT_CLASS = '.chat__input--name'
const MESSAGE_INPUT_CLASS = '.chat__input--message'

const DISABLED_MESSAGES_INPUT_PLACEHOLDER = 'Enter nickname to start messaging...'
const MESSAGES_INPUT_PLACEHOLDER = 'Message'

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

        clientsService.addClient(this.client)

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
        const messagesInput = this.querySelector(MESSAGE_INPUT_CLASS) as HTMLInputElement
        const nicknameInput = this.querySelector(NICKNAME_INPUT_CLASS) as HTMLInputElement

        messagesInput.addEventListener('keydown', (e: KeyboardEvent): void => this.handleMessageKeydown(e))
        nicknameInput.addEventListener('keydown', (e: KeyboardEvent): void => this.handleNicknameKeydown(e))

        window.addEventListener('storage', () => {
            this.loadMessages()
            this.renderMessages()
            this.scrollToNewestMessages()
        })

        if (!nicknameInput.value) {
            messagesInput.disabled = true
            messagesInput.placeholder = DISABLED_MESSAGES_INPUT_PLACEHOLDER
        }
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

    handleNicknameKeydown (event: KeyboardEvent): void {
        const target = event.target as HTMLInputElement
        const messagesInput = this.querySelector(MESSAGE_INPUT_CLASS) as HTMLInputElement

        if (event.keyCode === ENTER_KEYCODE && target.value) {
            this.client.name = target.value
            clientsService.updateClient(this.client)
            this.renderMessages()
            target.disabled = true
            messagesInput.disabled = false
            messagesInput.placeholder = MESSAGES_INPUT_PLACEHOLDER

            messagesInput.focus()
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