import './message.scss'
const template = require('./message.pug')()

import Client from '../../models/Client'
import Message from '../../models/Message'
import ClientsService from '../../services/clientsService'

export default class MessageComponent extends HTMLElement {
    public message: Message

    constructor () {
        super()
    }

    get template (): string {
        return template
    }

    render (): void {
        const sender = ClientsService.getClientById(this.message.senderId) || {}
        const messageRenderModel = Object.assign({}, this.message, {sender})
        this.innerHTML = Object.keys(messageRenderModel)
            .reduce((tpl: string, key: string): string => {
                return tpl.replace(new RegExp(`{{\\s?${key}\\s?}}`), this.formatMessageFieldOutput(messageRenderModel, key))
            }, this.template)
    }

    formatMessageFieldOutput (message: Message, fieldKey: string): string {
        const formatters = this.getFormatters()
        if (message[fieldKey]) {
            if (formatters[fieldKey]) {
                return formatters[fieldKey](message[fieldKey])
            } else {
                return message[fieldKey]
            }
        }

        return null
    }

    getFormatters (): any {
        return {
            sender: client => (client && client.name) ? client.name : Client.defaultName,
            senderId: value => value,
            text: value => value,
            date: value => `${value.getHours()}:${value.getMinutes()}`
        }
    }

    connectedCallback (): void {
        this.classList.add('message')
        this.render()
    }

    static get observedAttributes (): string[] {
        return [
            'message'
        ];
    }

    attributeChangedCallback (attrName, oldVal, newVal): void {
        if (attrName === 'message') {
            this.message = Message.build(JSON.parse(newVal))
            this.render()
        }
    }
}

window.customElements.define('message-component', MessageComponent)